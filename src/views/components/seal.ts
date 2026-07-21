import type { LevelInfo, Rank, Theme } from '../../types';
import { LAYOUT } from '../layout';

/**
 * Sello circular del gremio: el nivel del aventurero como firma oficial
 * del documento. Anillo con micro-texto circular, borde punteado tipo
 * estampado y el color del rango. En hover (SVG directo/embed) gira sutil.
 */
export const seal = (levelInfo: LevelInfo, rank: Rank, theme: Theme): string => {
  const { cx, cy, radius: r } = LAYOUT.seal;
  const textRadius = r - 6.5;

  return `
  <g class="seal">
    <defs>
      <path id="sealTextPath"
        d="M ${cx} ${cy - textRadius} a ${textRadius} ${textRadius} 0 1 1 -0.01 0" />
    </defs>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="${theme.surface}"
      stroke="${rank.color}" stroke-width="1.5" />
    <circle cx="${cx}" cy="${cy}" r="${r - 3.5}" fill="none"
      stroke="${rank.color}" stroke-width="0.75" stroke-dasharray="2 2.5" opacity="0.8" />
    <text font-family="${theme.fontFamily}" font-size="5.4" letter-spacing="1.6"
      fill="${rank.color}" opacity="0.9">
      <textPath href="#sealTextPath" xlink:href="#sealTextPath" startOffset="0">
        ✦ GREMIO DE AVENTUREROS ✦ ${rank.name.toUpperCase()}
      </textPath>
    </text>
    <text x="${cx}" y="${cy - 3}" text-anchor="middle"
      font-family="${theme.fontFamily}" font-size="8" letter-spacing="1"
      fill="${theme.textSecondary}">NIVEL</text>
    <text x="${cx}" y="${cy + 14}" text-anchor="middle"
      font-family="${theme.fontFamily}" font-size="17" font-weight="800"
      fill="${theme.accent}">${levelInfo.level}</text>
  </g>
`;
};
