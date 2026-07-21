import type { Achievement } from '../types';

/**
 * Registro de logros. Añadir un logro = añadir una entrada; los servicios
 * no cambian. Se muestran como máximo los primeros N desbloqueados
 * (el orden aquí define la prioridad de aparición).
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'commit-slayer-1000',
    shortTitle: 'Slayer 1000',
    title: 'Slayer de 1000 commits',
    icon: '⚔️',
    unlockedBy: (m) => m.totalCommits >= 1000,
  },
  {
    id: 'pr-champion-100',
    shortTitle: '100 PRs',
    title: 'Campeón de 100 PRs',
    icon: '🏆',
    unlockedBy: (m) => m.totalPullRequests >= 100,
  },
  {
    id: 'guardian-reviews-50',
    shortTitle: 'Guardián',
    title: 'Guardián del Código',
    icon: '🛡️',
    unlockedBy: (m) => m.totalReviews >= 50,
  },
  {
    id: 'star-collector-100',
    shortTitle: 'Estrellas',
    title: 'Coleccionista de Estrellas',
    icon: '✨',
    unlockedBy: (m) => m.totalStars >= 100,
  },
  {
    id: 'streak-30',
    shortTitle: 'Llama Eterna',
    title: 'Llama Eterna (racha 30d)',
    icon: '🔥',
    unlockedBy: (m) => m.currentStreak >= 30,
  },
  {
    id: 'polyglot-5',
    shortTitle: 'Políglota',
    title: 'Políglota Arcano',
    icon: '📜',
    unlockedBy: (m) => m.languageCount >= 5,
  },
  {
    id: 'open-source-knight',
    shortTitle: 'Open Source',
    title: 'Caballero Open Source',
    icon: '🗡️',
    unlockedBy: (m) => m.externalMergedPRs >= 10,
  },
  {
    id: 'veteran-5y',
    shortTitle: 'Veterano',
    title: 'Veterano del Reino',
    icon: '🏰',
    unlockedBy: (m) => m.accountAgeYears >= 5,
  },
];

/** Máximo de logros mostrados en la tarjeta. */
export const MAX_BADGES_ON_CARD = 3;
