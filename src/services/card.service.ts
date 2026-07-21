import type { AdventurerProfile, GitHubMetrics, MetricsProvider, Theme } from '../types';
import { renderCard } from '../views/card.view';
import { buildAdventurerProfile } from './adventurer.service';

export interface ResolvedProfile {
  profile: AdventurerProfile;
  /** Métricas crudas (el reverso muestra el registro detallado). */
  metrics: GitHubMetrics;
  /** false si faltaron años por límites de GitHub → cachear poco. */
  complete: boolean;
}

export interface GeneratedCard {
  svg: string;
  complete: boolean;
}

/**
 * Métricas → perfil de aventurero. Recibe el provider por parámetro
 * (real o mock) — inyección simple. Las vistas (SVG plano, embed HTML)
 * renderizan a partir de este mismo perfil.
 */
export const resolveProfile = async (
  username: string,
  provider: MetricsProvider,
): Promise<ResolvedProfile> => {
  const metrics = await provider.fetchMetrics(username);
  return {
    profile: buildAdventurerProfile(metrics),
    metrics,
    complete: metrics.incompleteYears === 0,
  };
};

/** Composición para el endpoint clásico: perfil → SVG plano. */
export const generateCardSvg = async (
  username: string,
  provider: MetricsProvider,
  theme: Theme,
): Promise<GeneratedCard> => {
  const { profile, complete } = await resolveProfile(username, provider);
  return { svg: renderCard(profile, theme), complete };
};
