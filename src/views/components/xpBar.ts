import type { LevelInfo, Theme } from '../../types';
import { compactNumber } from '../../utils/format.util';
import { LAYOUT } from '../layout';

/** Barra de progreso de experiencia hacia el siguiente nivel. */
export const xpBar = (levelInfo: LevelInfo, theme: Theme): string => {
  const { marginX, xpY, width } = LAYOUT;
  const barWidth = width - marginX * 2;
  const progress = Math.min(1, levelInfo.currentXp / levelInfo.nextLevelXp);
  const fillWidth = Math.max(2, progress * barWidth);

  return `
  <g>
    <text x="${marginX}" y="${xpY - 7}" font-family="${theme.fontFamily}"
      font-size="9" letter-spacing="2" fill="${theme.textSecondary}">EXPERIENCIA</text>
    <text x="${marginX + barWidth}" y="${xpY - 7}" text-anchor="end"
      font-family="${theme.fontFamily}" font-size="11" fill="${theme.textSecondary}">
      ${compactNumber(levelInfo.currentXp)} / ${compactNumber(levelInfo.nextLevelXp)}
    </text>
    <rect x="${marginX}" y="${xpY}" width="${barWidth}" height="10" rx="5" fill="${theme.barTrack}" />
    <rect class="bar-fill" x="${marginX}" y="${xpY}" width="${fillWidth}" height="10" rx="5"
      fill="${theme.accent}" style="animation-delay: 0.7s" />
  </g>
`;
};
