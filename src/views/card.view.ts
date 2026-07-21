import type { AdventurerProfile, CardLayers, Theme } from '../types';
import { badges } from './components/badges';
import { frame } from './components/frame';
import { header } from './components/header';
import { ornaments } from './components/ornaments';
import { seal } from './components/seal';
import { statBars } from './components/statBars';
import { watermark } from './components/watermark';
import { xpBar } from './components/xpBar';
import { LAYOUT } from './layout';

/**
 * Estilos compartidos por el SVG plano y el embed: animaciones de entrada
 * y realces de :hover. Dentro de <img> (GitHub) el hover es inerte pero
 * las animaciones sí corren; en <object>/pestaña directa/embed funciona todo.
 */
export const cardStyles = (scope: string): string => `
  ${scope} .bar-fill {
    transform-box: fill-box;
    transform-origin: left;
    animation: grow 0.9s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  }
  @keyframes grow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  ${scope} .bar-tip {
    animation: appear 0.35s ease backwards;
  }
  @keyframes appear {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  ${scope} .glow-boost {
    opacity: 0;
    transition: opacity 0.45s ease;
  }
  ${scope}:hover .glow-boost { opacity: 1; }
  ${scope} .seal {
    transform-box: fill-box;
    transform-origin: center;
    transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  }
  ${scope}:hover .seal { transform: rotate(-7deg) scale(1.05); }
  ${scope} .stat { transition: filter 0.3s ease; }
  ${scope}:hover .stat { filter: brightness(1.18); }
`;

/**
 * La tarjeta descompuesta en capas de profundidad. Única fuente de verdad
 * del dibujo: el SVG plano las concatena y el embed 3D las apila.
 */
export const renderCardLayers = (
  profile: AdventurerProfile,
  theme: Theme,
): CardLayers => ({
  base: frame(theme, profile.rank) + ornaments(theme),
  depth: watermark(profile.adventurerClass, theme),
  content:
    header(profile, theme) +
    statBars(profile.attributes, theme) +
    xpBar(profile.levelInfo, theme),
  overlay:
    seal(profile.levelInfo, profile.rank, theme) +
    badges(profile.skill, profile.achievements, theme),
});

/** SVG completo (README, <object>, pestaña directa). */
export const renderCard = (profile: AdventurerProfile, theme: Theme): string => {
  const layers = renderCardLayers(profile, theme);
  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${LAYOUT.width}" height="${LAYOUT.height}"
  viewBox="0 0 ${LAYOUT.width} ${LAYOUT.height}"
  role="img" aria-label="Carta de aventurero de ${profile.username}">
  <style>${cardStyles('svg')}</style>
  ${layers.base}
  ${layers.depth}
  ${layers.content}
  ${layers.overlay}
</svg>`;
};
