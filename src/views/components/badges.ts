import { MAX_BADGES_ON_CARD } from '../../config/achievements.config';
import type { Achievement, Skill, Theme } from '../../types';
import { escapeXml } from '../../utils/format.util';
import { LAYOUT } from '../layout';

const BADGES_Y = LAYOUT.badgesY;
/** Ancho aproximado por carácter para dimensionar el chip. */
const CHAR_WIDTH = 6.4;
/** Límite derecho: los chips que no caben no se dibujan. */
const MAX_X = LAYOUT.width - LAYOUT.marginX;

const chip = (
  x: number,
  label: string,
  theme: Theme,
  highlighted: boolean,
): { svg: string; width: number } => {
  const width = Math.round(label.length * CHAR_WIDTH) + 16;
  const fill = highlighted ? theme.accent : theme.accentSoft;
  const textColor = highlighted ? theme.backgroundGradient[0] : theme.textPrimary;
  return {
    width,
    svg: `
    <g transform="translate(${x}, ${BADGES_Y})">
      <rect width="${width}" height="22" rx="11" fill="${fill}"
        stroke="${theme.accent}" stroke-width="0.5" />
      <text x="${width / 2}" y="15" text-anchor="middle"
        font-family="${theme.fontFamily}" font-size="11" font-weight="${highlighted ? 700 : 400}"
        fill="${textColor}">${escapeXml(label)}</text>
    </g>`,
  };
};

/**
 * Fila inferior: primero la habilidad especial (chip destacado en dorado)
 * y después los logros desbloqueados que quepan.
 */
export const badges = (
  skill: Skill,
  achievements: Achievement[],
  theme: Theme,
): string => {
  const chips: string[] = [];
  let x = 28;

  const skillChip = chip(x, `${skill.icon} ${skill.name}`, theme, true);
  chips.push(skillChip.svg);
  x += skillChip.width + 8;

  for (const a of achievements.slice(0, MAX_BADGES_ON_CARD)) {
    const badgeChip = chip(x, `${a.icon} ${a.title}`, theme, false);
    if (x + badgeChip.width > MAX_X) break; // no cabe: se omite y no se corta
    chips.push(badgeChip.svg);
    x += badgeChip.width + 8;
  }

  return chips.join('');
};
