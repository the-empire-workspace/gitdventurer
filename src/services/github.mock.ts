import type { GitHubMetrics, MetricsProvider } from '../types';

/**
 * Provider de demostración (?demo=1): métricas fijas para desarrollar y
 * previsualizar la tarjeta sin token de GitHub. Implementa MetricsProvider,
 * así que sustituye al cliente real sin tocar nada más.
 */
export const createMockProvider = (): MetricsProvider => ({
  async fetchMetrics(username: string): Promise<GitHubMetrics> {
    return {
      username,
      displayName: username,
      totalCommits: 6200,
      privateContributions: 4800,
      totalPullRequests: 340,
      totalReviews: 210,
      totalIssues: 120,
      totalStars: 152,
      followers: 48,
      ownedRepos: 22,
      languageCount: 6,
      currentStreak: 34,
      activeDaysLastYear: 208,
      accountAgeYears: 6,
      memberSinceYear: 2020,
      externalMergedPRs: 12,
      incompleteYears: 0,
    };
  },
});
