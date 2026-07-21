import { resolveAchievementStatuses } from '../services/adventurer.service';
import type { AdventurerProfile, GitHubMetrics, Theme } from '../types';
import { compactNumber, escapeXml } from '../utils/format.util';
import { cardStyles } from './card.view';
import { frame } from './components/frame';
import { ornaments } from './components/ornaments';
import { seal } from './components/seal';
import { watermark } from './components/watermark';
import { LAYOUT } from './layout';

/** Grid de métricas crudas: 2 columnas × 4 filas con puntos de guía. */
const metricsGrid = (metrics: GitHubMetrics, theme: Theme): string => {
  const entries: Array<[string, string]> = [
    ['Commits', compactNumber(metrics.totalCommits)],
    ['Contrib. privadas', compactNumber(metrics.privateContributions)],
    ['Pull requests', compactNumber(metrics.totalPullRequests)],
    ['Reviews', compactNumber(metrics.totalReviews)],
    ['Issues', compactNumber(metrics.totalIssues)],
    ['Stars', compactNumber(metrics.totalStars)],
    ['Followers', compactNumber(metrics.followers)],
    ['Lenguajes', String(metrics.languageCount)],
  ];
  const { marginX, width } = LAYOUT;
  const columnWidth = (width - marginX * 2 - 44) / 2;

  return entries
    .map(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = marginX + col * (columnWidth + 44);
      const y = 126 + row * 23;
      return `
    <g transform="translate(${x}, ${y})">
      <text x="0" y="0" font-family="${theme.fontFamily}" font-size="11.5"
        fill="${theme.textSecondary}">${label}</text>
      <line x1="${label.length * 6.2 + 8}" y1="-3" x2="${columnWidth - String(value).length * 7.5 - 10}" y2="-3"
        stroke="${theme.border}" stroke-width="1" stroke-dasharray="1.5 3.5" />
      <text x="${columnWidth}" y="0" text-anchor="end" font-family="${theme.fontFamily}"
        font-size="12.5" font-weight="700" fill="${theme.textPrimary}">${value}</text>
    </g>`;
    })
    .join('');
};

/** Los 8 logros: chips dorados (desbloqueados) o apagados (pendientes). */
const achievementGrid = (metrics: GitHubMetrics, theme: Theme): string => {
  const statuses = resolveAchievementStatuses(metrics);
  const { marginX, width } = LAYOUT;
  const gap = 8;
  const chipWidth = (width - marginX * 2 - gap * 3) / 4;

  return statuses
    .map(({ achievement, unlocked }, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = marginX + col * (chipWidth + gap);
      const y = 228 + row * 26;
      const fill = unlocked ? theme.accentSoft : 'transparent';
      const stroke = unlocked ? theme.accent : theme.border;
      const textColor = unlocked ? theme.textPrimary : theme.textSecondary;
      return `
    <g opacity="${unlocked ? 1 : 0.45}">
      <rect x="${x}" y="${y}" width="${chipWidth}" height="20" rx="10"
        fill="${fill}" stroke="${stroke}" stroke-width="0.5" />
      <text x="${x + chipWidth / 2}" y="${y + 13.5}" text-anchor="middle"
        font-family="${theme.fontFamily}" font-size="10"
        fill="${textColor}">${achievement.icon} ${escapeXml(achievement.shortTitle)}</text>
    </g>`;
    })
    .join('');
};

/**
 * Reverso de la carta: el registro oficial del gremio — miembro desde,
 * métricas crudas de por vida y el estado de los 8 logros. Mismo marco,
 * sello y marca de agua que el frente.
 */
export const renderCardBack = (
  profile: AdventurerProfile,
  metrics: GitHubMetrics,
  theme: Theme,
): string => {
  const { marginX, width, height } = LAYOUT;
  const name = escapeXml(profile.displayName);

  return `<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  width="${width}" height="${height}"
  viewBox="0 0 ${width} ${height}"
  role="img" aria-label="Registro del gremio de ${profile.username}">
  <style>${cardStyles('svg')}</style>
  ${frame(theme, profile.rank)}
  ${ornaments(theme)}
  ${watermark(profile.adventurerClass, theme)}
  <g transform="translate(${marginX}, 26)">
    <text x="0" y="14" font-family="${theme.fontFamily}" font-size="9"
      letter-spacing="2.5" fill="${theme.textSecondary}">REGISTRO DEL GREMIO</text>
    <text x="0" y="36" font-family="${theme.fontFamily}" font-size="19"
      font-weight="700" fill="${theme.textPrimary}">${name}</text>
    <text x="0" y="54" font-family="${theme.fontFamily}" font-size="12"
      fill="${theme.textSecondary}">Miembro desde
      <tspan fill="${theme.accent}" font-weight="600">${metrics.memberSinceYear}</tspan>
      · ${metrics.ownedRepos} repositorios · racha ${metrics.currentStreak}d</text>
  </g>
  ${seal(profile.levelInfo, profile.rank, theme)}
  ${metricsGrid(metrics, theme)}
  <text x="${marginX}" y="216" font-family="${theme.fontFamily}" font-size="9"
    letter-spacing="2" fill="${theme.textSecondary}">HAZAÑAS</text>
  ${achievementGrid(metrics, theme)}
  <text x="${width / 2}" y="${height - 13}" text-anchor="middle"
    font-family="${theme.fontFamily}" font-size="7.5" letter-spacing="2"
    fill="${theme.textSecondary}" opacity="0.75">
    EXPEDIDA POR EL GREMIO · @${escapeXml(profile.username).toUpperCase()}
  </text>
</svg>`;
};
