import type { AdventurerProfile, GitHubMetrics, Theme } from '../types';
import { renderCardBack } from './back.view';
import { cardStyles, renderCardLayers } from './card.view';
import { LAYOUT } from './layout';

/** Profundidad (translateZ) de cada capa en el espacio 3D. */
const LAYER_DEPTH = { base: 0, depth: 14, content: 28, overlay: 42 } as const;

const layerSvg = (fragment: string, depth: number): string => `
      <svg class="layer" style="transform: translateZ(${depth}px)"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 ${LAYOUT.width} ${LAYOUT.height}">${fragment}</svg>`;

/**
 * Página HTML autocontenida para iframes: la tarjeta de gremio en 3D.
 * Las 4 capas SVG se apilan con translateZ y la tarjeta se inclina
 * siguiendo el puntero (parallax); un brillo especular recorre la
 * superficie y un click la voltea al reverso (registro del gremio).
 * Respeta prefers-reduced-motion.
 */
export const renderEmbed = (
  profile: AdventurerProfile,
  metrics: GitHubMetrics,
  theme: Theme,
): string => {
  const layers = renderCardLayers(profile, theme);
  const backSvg = renderCardBack(profile, metrics, theme)
    .replace('<svg', '<svg class="back-face"');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Carta de aventurero — ${profile.username}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { height: 100%; background: transparent; }
  body {
    display: grid;
    place-items: center;
    font-family: ${theme.fontFamily};
    overflow: hidden;
  }
  .scene {
    position: relative;
    perspective: 1100px;
    width: min(${LAYOUT.width}px, 94vw);
    aspect-ratio: ${LAYOUT.width} / ${LAYOUT.height};
  }
  .card {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
    will-change: transform;
  }
  .card { cursor: pointer; }
  .layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .back-face {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotateY(180deg) translateZ(2px);
  }
  /*
   * Sin backface-visibility a propósito: el compositor GPU de Chrome lo
   * calcula mal cuando las capas SVG llevan filtros (glow/textura) — a
   * veces transparenta la cara oculta en espejo, a veces esconde la cara
   * visible. Tampoco transiciones CSS de visibility (con duración 0s
   * pueden quedar atascadas). El intercambio de caras lo hace el JS
   * conmutando .flipped a los ~90ms del giro: el instante en que el
   * easing cruza los 90° y la carta está de canto.
   */
  .card.flipped .layer { visibility: hidden; }
  .card:not(.flipped) .back-face { visibility: hidden; }
  .hint {
    position: absolute;
    left: 50%;
    bottom: -26px;
    transform: translateX(-50%);
    font-size: 10px;
    letter-spacing: 2px;
    color: #8b87a8;
    opacity: 0.7;
    user-select: none;
  }
  .shine {
    position: absolute;
    inset: 0;
    border-radius: 14px;
    transform: translateZ(48px);
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
    mix-blend-mode: screen;
  }
  .card:hover .shine { opacity: 1; }
  ${cardStyles('.card')}
  @media (prefers-reduced-motion: reduce) {
    .card, .shine, .seal, .glow-boost, .layer, .back-face { transition: none !important; }
    .bar-fill, .bar-tip { animation: none !important; }
  }
</style>
</head>
<body>
  <div class="scene">
    <div class="card" id="card">
${layerSvg(layers.base, LAYER_DEPTH.base)}
${layerSvg(layers.depth, LAYER_DEPTH.depth)}
${layerSvg(layers.content, LAYER_DEPTH.content)}
${layerSvg(layers.overlay, LAYER_DEPTH.overlay)}
${backSvg}
      <div class="shine" id="shine"></div>
    </div>
    <span class="hint">CLICK PARA VOLTEAR</span>
  </div>
  <script>
    (() => {
      const card = document.getElementById('card');
      const shine = document.getElementById('shine');
      const MAX_TILT_X = 9;
      const MAX_TILT_Y = 13;
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let flipped = false;
      let tiltX = 0;
      let tiltY = 0;

      const apply = (transition) => {
        card.style.transition = transition;
        card.style.transform =
          'rotateY(' + ((flipped ? 180 : 0) + tiltY).toFixed(2) + 'deg) ' +
          'rotateX(' + tiltX.toFixed(2) + 'deg)';
      };

      // El flip funciona siempre; el tilt respeta prefers-reduced-motion.
      // La clase .flipped (que intercambia las caras) se conmuta cuando la
      // carta cruza los 90° — con este easing, ~90ms tras iniciar el giro.
      card.addEventListener('click', () => {
        flipped = !flipped;
        tiltX = 0;
        tiltY = 0;
        apply(reducedMotion ? 'none' : 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)');
        setTimeout(
          () => card.classList.toggle('flipped', flipped),
          reducedMotion ? 0 : 90,
        );
      });

      if (reducedMotion) return;

      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        tiltY = px * MAX_TILT_Y * (flipped ? -1 : 1);
        tiltX = -py * MAX_TILT_X;
        apply('transform 0.06s linear');
        shine.style.background =
          'radial-gradient(circle at ' + ((px + 0.5) * 100).toFixed(1) + '% ' +
          ((py + 0.5) * 100).toFixed(1) + '%, ' +
          'rgba(245, 197, 66, 0.28), rgba(245, 197, 66, 0.06) 45%, transparent 65%)';
      });

      card.addEventListener('pointerleave', () => {
        tiltX = 0;
        tiltY = 0;
        apply('transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)');
      });
    })();
  </script>
</body>
</html>`;
};

/** Envuelve un SVG de error en la página embed (sin interactividad). */
export const renderEmbedError = (errorSvg: string): string => `<!doctype html>
<html lang="es">
<head><meta charset="utf-8" /><title>Carta no disponible</title>
<style>html,body{height:100%;margin:0;display:grid;place-items:center;background:transparent}</style>
</head>
<body>${errorSvg}</body>
</html>`;
