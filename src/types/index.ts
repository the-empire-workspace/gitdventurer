/**
 * Métricas crudas obtenidas de la API de GitHub.
 * Los totales de actividad son de POR VIDA (desde la creación de la cuenta),
 * sumando un rango anual por cada año de antigüedad.
 */
export interface GitHubMetrics {
  username: string;
  /** Nombre visible del usuario (puede ser null en GitHub). */
  displayName: string | null;
  /** Commits de toda la vida de la cuenta. */
  totalCommits: number;
  /**
   * Contribuciones en repos privados de toda la vida (restricted).
   * Solo son visibles si el token puede ver esos repos (p. ej. el dueño).
   */
  privateContributions: number;
  /** PRs abiertos de toda la vida. */
  totalPullRequests: number;
  /** Reviews de toda la vida. */
  totalReviews: number;
  /** Issues abiertos de toda la vida. */
  totalIssues: number;
  totalStars: number;
  followers: number;
  /** Repositorios públicos propios (no forks). */
  ownedRepos: number;
  /** Lenguajes distintos usados en sus repos. */
  languageCount: number;
  /** Días consecutivos con contribuciones (racha actual). */
  currentStreak: number;
  /** Días con al menos una contribución en el último año. */
  activeDaysLastYear: number;
  /** Años desde la creación de la cuenta. */
  accountAgeYears: number;
  /** Año de creación de la cuenta ("miembro desde"). */
  memberSinceYear: number;
  /** PRs mergeados en repos que no son suyos (open source). */
  externalMergedPRs: number;
  /**
   * Años que no pudieron obtenerse por límites de GitHub en esta pasada.
   * Si es > 0 la ficha es parcial y conviene cachearla poco para que se
   * complete sola en la siguiente carga (los años ya obtenidos se cachean).
   */
  incompleteYears: number;
}

export type AttributeKey = 'STR' | 'DEX' | 'INT' | 'WIS' | 'CHA' | 'VIT';

/** Atributos RPG normalizados a 0–100. */
export type Attributes = Record<AttributeKey, number>;

export type ClassId =
  | 'warrior'
  | 'ranger'
  | 'paladin'
  | 'mage'
  | 'alchemist'
  | 'bard';

export interface AdventurerClass {
  id: ClassId;
  name: string;
  /** Atributo que domina para ganar esta clase. */
  dominantAttribute: AttributeKey;
  /** Path SVG del emblema (viewBox 0 0 24 24). */
  emblemPath: string;
  /** Título por rango (Bronce → Leyenda): la clase evoluciona al subir. */
  tiers: [string, string, string, string, string];
}

/** Habilidad especial derivada de la combinación de los 2 stats más altos. */
export interface Skill {
  id: string;
  name: string;
  icon: string;
}

export type RankId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legend';

export interface Rank {
  id: RankId;
  name: string;
  /** Nivel mínimo para alcanzar este rango. */
  minLevel: number;
  /** Color del glow del borde de la tarjeta. */
  color: string;
}

export interface Achievement {
  id: string;
  /** Título mostrado en la tarjeta. */
  title: string;
  /** Título corto para el reverso (chips compactos). */
  shortTitle: string;
  /** Emoji/ícono corto. */
  icon: string;
  /** Condición de desbloqueo. */
  unlockedBy: (metrics: GitHubMetrics) => boolean;
}

/** Estado de un logro para el reverso: desbloqueado o pendiente. */
export interface AchievementStatus {
  achievement: Achievement;
  unlocked: boolean;
}

export interface LevelInfo {
  level: number;
  /** XP acumulada dentro del nivel actual. */
  currentXp: number;
  /** XP necesaria para subir al siguiente nivel. */
  nextLevelXp: number;
}

/** Perfil final calculado: lo que se renderiza en la ficha. */
export interface AdventurerProfile {
  username: string;
  displayName: string;
  adventurerClass: AdventurerClass;
  /** Título evolucionado según el rango (p. ej. Guerrero+Oro → Caballero). */
  classTitle: string;
  /** Habilidad especial según los 2 atributos dominantes. */
  skill: Skill;
  attributes: Attributes;
  levelInfo: LevelInfo;
  rank: Rank;
  achievements: Achievement[];
}

/** Paleta y tipografía de un theme de la tarjeta. */
export interface Theme {
  id: string;
  backgroundGradient: [string, string];
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  barTrack: string;
  fontFamily: string;
  /** Dorado envejecido de filigranas y esquinas (más apagado que accent). */
  ornament: string;
  /** Opacidad de la textura de pergamino (0–1, sutil). */
  textureOpacity: number;
  /** Opacidad de la marca de agua del emblema. */
  watermarkOpacity: number;
}

/**
 * La tarjeta descompuesta en capas de profundidad (fragmentos SVG sin
 * envoltorio <svg>): el SVG plano las concatena; el embed HTML las apila
 * en 3D con parallax. Misma fuente de verdad para ambas superficies.
 */
export interface CardLayers {
  /** z=0 — fondo, textura, marco, filigranas. */
  base: string;
  /** z=14 — marca de agua del emblema. */
  depth: string;
  /** z=28 — cabecera, stats, XP. */
  content: string;
  /** z=42 — sello del gremio, chips. */
  overlay: string;
}

/** Puerto para obtener métricas — lo implementan el cliente real y el mock. */
export interface MetricsProvider {
  fetchMetrics(username: string): Promise<GitHubMetrics>;
}

/** Bindings del Worker (wrangler). */
export interface Env {
  GITHUB_TOKEN?: string;
}
