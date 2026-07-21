import type { Rank, Theme } from '../../types';
import { LAYOUT } from '../layout';

export const CARD_WIDTH = LAYOUT.width;
export const CARD_HEIGHT = LAYOUT.height;

/**
 * Marco del documento de gremio: fondo con gradiente, textura de pergamino
 * oscuro (ruido fractal sutil), borde exterior con glow del rango, borde
 * interior de filigrana y divisor-cinta bajo la cabecera.
 * `.glow-boost` es un duplicado invisible del borde que el :hover enciende.
 */
export const frame = (theme: Theme, rank: Rank): string => {
  const w = CARD_WIDTH;
  const h = CARD_HEIGHT;
  const { marginX, dividerY } = LAYOUT;
  const midX = w / 2;

  return `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.backgroundGradient[0]}" />
      <stop offset="100%" stop-color="${theme.backgroundGradient[1]}" />
    </linearGradient>
    <filter id="rankGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="${rank.color}" flood-opacity="0.55" />
    </filter>
    <filter id="rankGlowStrong" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="${rank.color}" flood-opacity="0.8" />
    </filter>
    <filter id="parchment">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
      <feColorMatrix in="noise" type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="linear" slope="${theme.textureOpacity}" /></feComponentTransfer>
      <feComposite operator="in" in2="SourceGraphic" />
    </filter>
    <linearGradient id="dividerFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${theme.ornament}" stop-opacity="0" />
      <stop offset="18%" stop-color="${theme.ornament}" stop-opacity="0.9" />
      <stop offset="82%" stop-color="${theme.ornament}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${theme.ornament}" stop-opacity="0" />
    </linearGradient>
  </defs>
  <!-- Fondo y borde exterior con glow del rango -->
  <rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="14"
    fill="url(#bg)" stroke="${rank.color}" stroke-width="1.5" filter="url(#rankGlow)" />
  <rect class="glow-boost" x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="14"
    fill="none" stroke="${rank.color}" stroke-width="1.5" filter="url(#rankGlowStrong)" />
  <!-- Textura de pergamino oscuro -->
  <rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="13"
    fill="#ffffff" filter="url(#parchment)" />
  <!-- Borde interior de filigrana -->
  <rect x="8" y="8" width="${w - 16}" height="${h - 16}" rx="9"
    fill="none" stroke="${theme.border}" stroke-width="1" />
  <!-- Divisor-cinta bajo la cabecera, con rombo central -->
  <rect x="${marginX}" y="${dividerY}" width="${w - marginX * 2}" height="1.25"
    fill="url(#dividerFade)" />
  <rect x="${midX - 3.5}" y="${dividerY - 3}" width="7" height="7"
    transform="rotate(45 ${midX} ${dividerY + 0.5})" fill="${theme.ornament}" />
`;
};
