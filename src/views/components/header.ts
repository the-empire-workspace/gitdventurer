import type { AdventurerProfile, Theme } from '../../types';
import { escapeXml } from '../../utils/format.util';
import { LAYOUT } from '../layout';

/**
 * Cabecera del documento: medallón con el emblema, nombre del aventurero
 * y título de clase · rango. El nivel vive en el sello (overlay).
 * Incluye la línea de registro al pie, como documento oficial.
 */
export const header = (profile: AdventurerProfile, theme: Theme): string => {
  const { adventurerClass, rank } = profile;
  const { marginX, headerY, height, width } = LAYOUT;
  const name = escapeXml(profile.displayName);

  return `
  <g transform="translate(${marginX}, ${headerY})">
    <!-- Medallón del emblema -->
    <circle cx="24" cy="24" r="24" fill="${theme.surface}" stroke="${rank.color}" stroke-width="1.5" />
    <circle cx="24" cy="24" r="20" fill="none" stroke="${theme.ornament}" stroke-width="0.75" opacity="0.7" />
    <g transform="translate(12, 12)" fill="${theme.accent}">
      <path d="${adventurerClass.emblemPath}" />
    </g>
    <!-- Identidad -->
    <text x="62" y="14" font-family="${theme.fontFamily}" font-size="9"
      letter-spacing="2.5" fill="${theme.textSecondary}">CARTA DE AVENTURERO</text>
    <text x="62" y="36" font-family="${theme.fontFamily}" font-size="19"
      font-weight="700" fill="${theme.textPrimary}">${name}</text>
    <text x="62" y="54" font-family="${theme.fontFamily}" font-size="12"
      fill="${theme.textSecondary}">${escapeXml(profile.classTitle)} · Rango
      <tspan fill="${rank.color}" font-weight="600">${rank.name}</tspan>
    </text>
  </g>
  <!-- Línea de registro al pie del documento -->
  <text x="${width / 2}" y="${height - 13}" text-anchor="middle"
    font-family="${theme.fontFamily}" font-size="7.5" letter-spacing="2"
    fill="${theme.textSecondary}" opacity="0.75">
    REGISTRO DEL GREMIO · @${escapeXml(profile.username).toUpperCase()}
  </text>
`;
};
