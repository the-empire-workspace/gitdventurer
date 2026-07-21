import type { Theme } from '../../types';
import { LAYOUT } from '../layout';

/** Distancia de la filigrana al borde interior. */
const INSET = 12;
/** Tamaño del brazo de cada esquina. */
const ARM = 22;

/**
 * Una esquina: bracket con curva interior y un pequeño rombo engastado.
 * Se dibuja para la esquina superior-izquierda y se espeja con transforms.
 */
const corner = (theme: Theme): string => `
  <path d="M ${INSET} ${INSET + ARM} L ${INSET} ${INSET + 7} Q ${INSET} ${INSET} ${INSET + 7} ${INSET} L ${INSET + ARM} ${INSET}"
    fill="none" stroke="${theme.ornament}" stroke-width="1.5" stroke-linecap="round" />
  <path d="M ${INSET + 4} ${INSET + ARM - 8} L ${INSET + 4} ${INSET + 10} Q ${INSET + 4} ${INSET + 4} ${INSET + 10} ${INSET + 4} L ${INSET + ARM - 8} ${INSET + 4}"
    fill="none" stroke="${theme.ornament}" stroke-width="0.75" opacity="0.6" />
  <rect x="${INSET + 9}" y="${INSET + 9}" width="5" height="5"
    transform="rotate(45 ${INSET + 11.5} ${INSET + 11.5})" fill="${theme.ornament}" />
`;

/** Cuatro filigranas de esquina, espejadas desde la superior-izquierda. */
export const ornaments = (theme: Theme): string => {
  const { width: w, height: h } = LAYOUT;
  const one = corner(theme);
  return `
  <g>${one}</g>
  <g transform="translate(${w} 0) scale(-1 1)">${one}</g>
  <g transform="translate(0 ${h}) scale(1 -1)">${one}</g>
  <g transform="translate(${w} ${h}) scale(-1 -1)">${one}</g>
`;
};
