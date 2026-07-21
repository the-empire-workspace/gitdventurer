import { ATTRIBUTE_ORDER } from '../../services/adventurer.service';
import type { Attributes, Theme } from '../../types';
import { LAYOUT } from '../layout';

const COLUMN_GAP = 44;
const BAR_WIDTH = 128;

/**
 * Seis barras de atributos en dos columnas de tres, con remate de rombo
 * en la punta del relleno. `.stat` habilita el realce en :hover.
 */
export const statBars = (attributes: Attributes, theme: Theme): string => {
  const { marginX, statsY, statsRowHeight, width } = LAYOUT;
  const columnWidth = (width - marginX * 2 - COLUMN_GAP) / 2;

  const rows = ATTRIBUTE_ORDER.map((key, i) => {
    const value = attributes[key];
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = marginX + col * (columnWidth + COLUMN_GAP);
    const y = statsY + row * statsRowHeight;
    const fillWidth = Math.max(2, (value / 100) * BAR_WIDTH);
    const tipX = 34 + fillWidth;

    return `
    <g class="stat" transform="translate(${x}, ${y})">
      <text x="0" y="10" font-family="${theme.fontFamily}" font-size="12"
        font-weight="600" fill="${theme.textSecondary}">${key}</text>
      <rect x="34" y="2" width="${BAR_WIDTH}" height="8" rx="4" fill="${theme.barTrack}" />
      <rect class="bar-fill" x="34" y="2" width="${fillWidth}" height="8" rx="4"
        fill="${theme.accent}" style="animation-delay: ${i * 0.12}s" />
      <path class="bar-tip" fill="${theme.accent}" style="animation-delay: ${0.55 + i * 0.12}s"
        d="M ${tipX - 4.2} 6 L ${tipX} 1.8 L ${tipX + 4.2} 6 L ${tipX} 10.2 Z" />
      <text x="${34 + BAR_WIDTH + 10}" y="10" font-family="${theme.fontFamily}"
        font-size="12" font-weight="700" fill="${theme.textPrimary}">${value}</text>
    </g>`;
  });

  return rows.join('');
};
