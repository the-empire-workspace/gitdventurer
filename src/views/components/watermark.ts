import type { AdventurerClass, Theme } from '../../types';
import { LAYOUT } from '../layout';

/**
 * El emblema de clase gigante como marca de agua, al estilo del troquelado
 * de un documento oficial. Capa de profundidad media en el embed 3D.
 */
export const watermark = (
  adventurerClass: AdventurerClass,
  theme: Theme,
): string => {
  const { x, y, scale } = LAYOUT.watermark;
  return `
  <g transform="translate(${x}, ${y}) scale(${scale})"
    fill="${theme.accent}" opacity="${theme.watermarkOpacity}">
    <path d="${adventurerClass.emblemPath}" />
  </g>
`;
};
