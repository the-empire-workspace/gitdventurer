import type { Rank } from '../types';

/**
 * Rangos ordenados de menor a mayor nivel mínimo.
 * El rango del aventurero es el último cuyo minLevel <= nivel.
 */
export const RANKS: Rank[] = [
  { id: 'bronze', name: 'Bronce', minLevel: 1, color: '#cd7f32' },
  { id: 'silver', name: 'Plata', minLevel: 15, color: '#c0c0c0' },
  { id: 'gold', name: 'Oro', minLevel: 30, color: '#f5c542' },
  { id: 'platinum', name: 'Platino', minLevel: 50, color: '#7de3f4' },
  { id: 'legend', name: 'Leyenda', minLevel: 75, color: '#c084fc' },
];
