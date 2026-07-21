import { ACHIEVEMENTS } from '../config/achievements.config';
import { CLASS_LIST } from '../config/classes.config';
import { RANKS } from '../config/ranks.config';
import { SKILLS, skillKey } from '../config/skills.config';
import type {
  Achievement,
  AchievementStatus,
  AdventurerClass,
  AdventurerProfile,
  AttributeKey,
  Attributes,
  GitHubMetrics,
  LevelInfo,
  Rank,
  Skill,
} from '../types';
import { logScale } from '../utils/math.util';

/**
 * Valores de saturación: con esta cifra el atributo llega a 100.
 * Calibrados para totales de POR VIDA (no solo el último año).
 */
const SATURATION = {
  commits: 25000, // ~10 años de dev muy activo
  streak: 100,
  languages: 12,
  reviews: 2000,
  charisma: 2000, // stars + followers
  accountYears: 12,
} as const;

/** Métricas → atributos RPG normalizados 0–100 (escala logarítmica). */
export const calculateAttributes = (metrics: GitHubMetrics): Attributes => ({
  STR: logScale(
    metrics.totalCommits + metrics.privateContributions,
    SATURATION.commits,
  ),
  DEX: logScale(metrics.currentStreak, SATURATION.streak),
  INT: logScale(metrics.languageCount, SATURATION.languages),
  WIS: logScale(metrics.totalReviews, SATURATION.reviews),
  CHA: logScale(metrics.totalStars + metrics.followers, SATURATION.charisma),
  VIT: logScale(metrics.accountAgeYears, SATURATION.accountYears),
});

/** La clase del aventurero es la asociada a su atributo más alto. */
export const resolveClass = (attributes: Attributes): AdventurerClass => {
  let best = CLASS_LIST[0]!;
  for (const cls of CLASS_LIST) {
    if (attributes[cls.dominantAttribute] > attributes[best.dominantAttribute]) {
      best = cls;
    }
  }
  return best;
};

/** XP total: cada acción pesa distinto (revisar > abrir PR > commit). */
export const calculateTotalXp = (metrics: GitHubMetrics): number =>
  metrics.totalCommits * 1 +
  metrics.privateContributions * 1 +
  metrics.totalPullRequests * 5 +
  metrics.totalReviews * 8 +
  metrics.totalIssues * 3 +
  metrics.totalStars * 4 +
  metrics.externalMergedPRs * 10;

/**
 * XP necesaria para pasar del nivel `level` al siguiente.
 * Curva (calibrada para XP de por vida): alcanzar el nivel L cuesta
 * 20·(L−1)² XP acumulada. Plata (15) ≈ 3.9k · Oro (30) ≈ 16.8k ·
 * Platino (50) ≈ 48k · Leyenda (75) ≈ 110k.
 */
export const xpForLevel = (level: number): number => 20 * (2 * level - 1);

/**
 * Nivel a partir de la XP total: subir cuesta cada vez más (crecimiento
 * ~raíz cuadrada de la XP).
 */
export const calculateLevel = (metrics: GitHubMetrics): LevelInfo => {
  const totalXp = calculateTotalXp(metrics);
  let level = 1;
  let spent = 0;
  while (totalXp - spent >= xpForLevel(level)) {
    spent += xpForLevel(level);
    level += 1;
  }
  return {
    level,
    currentXp: totalXp - spent,
    nextLevelXp: xpForLevel(level),
  };
};

/** Rango según nivel: el último cuyo minLevel <= nivel. */
export const resolveRank = (level: number): Rank => {
  let current = RANKS[0]!;
  for (const rank of RANKS) {
    if (level >= rank.minLevel) current = rank;
  }
  return current;
};

/** Logros desbloqueados, en el orden de prioridad del registro. */
export const resolveAchievements = (metrics: GitHubMetrics): Achievement[] =>
  ACHIEVEMENTS.filter((a) => a.unlockedBy(metrics));

/** Estado de TODOS los logros (para el reverso: dorados vs pendientes). */
export const resolveAchievementStatuses = (
  metrics: GitHubMetrics,
): AchievementStatus[] =>
  ACHIEVEMENTS.map((achievement) => ({
    achievement,
    unlocked: achievement.unlockedBy(metrics),
  }));

/**
 * Título de clase según el rango: la clase evoluciona al subir de rango
 * (Guerrero en Oro → Caballero). El índice del rango elige el tier.
 */
export const resolveClassTitle = (
  adventurerClass: AdventurerClass,
  rank: Rank,
): string => {
  const tierIndex = Math.max(0, RANKS.findIndex((r) => r.id === rank.id));
  return adventurerClass.tiers[tierIndex] ?? adventurerClass.name;
};

/**
 * Habilidad especial: la combinación de los 2 atributos más altos.
 * En empate decide el orden estable de ATTRIBUTE_ORDER.
 */
export const resolveSkill = (attributes: Attributes): Skill => {
  const [first, second] = [...ATTRIBUTE_ORDER].sort(
    (a, b) => attributes[b] - attributes[a],
  );
  const skill = SKILLS[skillKey(first!, second!)];
  if (!skill) throw new Error(`Habilidad no definida para ${first}+${second}`);
  return skill;
};

/** Compone el perfil completo del aventurero a partir de las métricas. */
export const buildAdventurerProfile = (
  metrics: GitHubMetrics,
): AdventurerProfile => {
  const attributes = calculateAttributes(metrics);
  const levelInfo = calculateLevel(metrics);
  const adventurerClass = resolveClass(attributes);
  const rank = resolveRank(levelInfo.level);
  return {
    username: metrics.username,
    displayName: metrics.displayName ?? metrics.username,
    adventurerClass,
    classTitle: resolveClassTitle(adventurerClass, rank),
    skill: resolveSkill(attributes),
    attributes,
    levelInfo,
    rank,
    achievements: resolveAchievements(metrics),
  };
};

/** Orden estable de atributos para el render. */
export const ATTRIBUTE_ORDER: AttributeKey[] = [
  'STR',
  'DEX',
  'INT',
  'WIS',
  'CHA',
  'VIT',
];
