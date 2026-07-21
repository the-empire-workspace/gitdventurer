import type { GitHubMetrics, MetricsProvider } from '../types';
import { getCachedJson, putCachedJson } from '../utils/cache.util';
import {
  buildYearsQuery,
  CREATED_AT_QUERY,
  PROFILE_QUERY,
  YEARS_PER_BATCH,
  yearRanges,
  type AdventurerProfileResponse,
  type AdventurerYearsResponse,
  type CreatedAtResponse,
  type YearContributions,
  type YearRange,
} from './github.queries';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

export type GitHubErrorKind = 'not-found' | 'rate-limit' | 'api-error';

export class GitHubServiceError extends Error {
  constructor(
    public readonly kind: GitHubErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'GitHubServiceError';
  }
}

type CalendarDay = { date: string; contributionCount: number };

/**
 * Racha actual: días consecutivos con contribuciones contando hacia atrás
 * desde el día más reciente. Si hoy aún no hay actividad, la racha no se
 * rompe: se empieza a contar desde ayer.
 */
export const calculateStreak = (days: CalendarDay[]): number => {
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (let i = 0; i < sorted.length; i++) {
    const day = sorted[i]!;
    if (day.contributionCount > 0) {
      streak += 1;
    } else if (i === 0) {
      continue; // hoy sin actividad todavía: no rompe la racha
    } else {
      break;
    }
  }
  return streak;
};

/** Suma los totales de todos los rangos anuales → actividad de por vida. */
export const sumYearContributions = (
  years: YearContributions[],
): Pick<
  GitHubMetrics,
  'totalCommits' | 'totalReviews' | 'totalIssues' | 'privateContributions'
> =>
  years.reduce(
    (acc, y) => ({
      totalCommits: acc.totalCommits + y.totalCommitContributions,
      totalReviews: acc.totalReviews + y.totalPullRequestReviewContributions,
      totalIssues: acc.totalIssues + y.totalIssueContributions,
      privateContributions:
        acc.privateContributions + y.restrictedContributionsCount,
    }),
    { totalCommits: 0, totalReviews: 0, totalIssues: 0, privateContributions: 0 },
  );

/** POST a la API GraphQL con manejo de errores HTTP comunes. */
const graphqlRequest = async <T>(
  token: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> => {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'gitdventurer',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (response.status === 403) {
    // Límite secundario (anti-abuso) de GitHub: pasa solo, en ~1 minuto
    throw new GitHubServiceError(
      'rate-limit',
      'GitHub está saturado — reintenta en un minuto',
    );
  }
  if (response.status === 401) {
    throw new GitHubServiceError('rate-limit', 'Token de GitHub inválido');
  }
  if (!response.ok) {
    throw new GitHubServiceError('api-error', `GitHub respondió ${response.status}`);
  }
  return (await response.json()) as T;
};

/** Parte un array en trozos de tamaño `size`. */
const chunk = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

/**
 * Ejecuta `fn` sobre cada item con como máximo `limit` promesas en vuelo.
 * GitHub aplica un rate limit secundario (anti-abuso) si se le lanzan
 * demasiadas requests concurrentes, así que ni secuencial ni todo-paralelo.
 */
const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
};

/** Máximo de requests simultáneas contra GitHub (perfil aparte). */
const MAX_CONCURRENT_BATCHES = 2;

/** Cliente real de la API GraphQL de GitHub. Implementa MetricsProvider. */
export const createGitHubProvider = (token: string): MetricsProvider => ({
  async fetchMetrics(username: string): Promise<GitHubMetrics> {
    // Paso 1: fecha de creación de la cuenta (define cuántos años sumar)
    const created = await graphqlRequest<CreatedAtResponse>(
      token,
      CREATED_AT_QUERY,
      { login: username },
    );
    if (created.errors?.some((e) => e.type === 'NOT_FOUND') || !created.data?.user) {
      throw new GitHubServiceError('not-found', `El aventurero "${username}" no existe en este reino`);
    }
    const createdAt = created.data.user.createdAt;
    const ranges = yearRanges(createdAt);

    // Paso 2: perfil + años. Dos límites de GitHub en juego:
    //  - "Resource limits exceeded" (por query): el presupuesto depende del
    //    volumen de actividad → divide-y-vencerás en años individuales.
    //  - Límite secundario 403 (por minuto/token): NO conviene insistir →
    //    se omiten los años restantes y la ficha parcial se cachea poco.
    // Los años históricos NUNCA cambian, así que se cachean 7 días por
    // (usuario, año): en la siguiente carga solo se pide lo que faltó.
    const isResourceLimit = (message: string): boolean =>
      /resource limits/i.test(message) || /timeout/i.test(message);

    const yearKey = (range: YearRange): string =>
      `https://gitdventurer-cache.internal/years/${username.toLowerCase()}/${range.from}`;
    const lastRange = ranges[ranges.length - 1];

    let secondaryLimitHit = false;

    /** Devuelve resultados ALINEADOS con `batch` (null = año no obtenido). */
    const fetchYearBatch = async (
      batch: YearRange[],
      attempt = 1,
    ): Promise<Array<YearContributions | null>> => {
      if (secondaryLimitHit) return batch.map(() => null);

      let message: string;
      try {
        const payload = await graphqlRequest<AdventurerYearsResponse>(
          token,
          buildYearsQuery(batch),
          { login: username },
        );
        const user = payload.data?.user;
        if (user) return batch.map((_, i) => user[`y${i}`] ?? null);
        message = payload.errors?.[0]?.message ?? 'Respuesta inesperada de GitHub';
        if (!isResourceLimit(message)) {
          throw new GitHubServiceError('api-error', message);
        }
      } catch (error) {
        if (error instanceof GitHubServiceError && error.kind === 'rate-limit') {
          // Límite secundario: dejar de pedir años en esta pasada
          secondaryLimitHit = true;
          return batch.map(() => null);
        }
        throw error;
      }

      // "Resource limits" por query: partir el lote o reintentar el año solo
      if (batch.length > 1) {
        const split: Array<YearContributions | null> = [];
        for (const range of batch) {
          split.push(...(await fetchYearBatch([range])));
        }
        return split;
      }
      if (attempt < 3) {
        // La caché fría del backend de GitHub suele sanar al reintentar
        await new Promise((r) => setTimeout(r, 500 * attempt));
        return fetchYearBatch(batch, attempt + 1);
      }
      // Año incomputable (años con actividad monstruosa nunca pasan el
      // presupuesto): lápida en cero por 24h para dejar de reintentarlo.
      // La ficha subconta ese año, pero converge y se reintenta a diario.
      console.warn(`Año omitido por límites de GitHub: ${batch[0]?.from}`);
      await putCachedJson(
        yearKey(batch[0]!),
        {
          totalCommitContributions: 0,
          totalPullRequestReviewContributions: 0,
          totalIssueContributions: 0,
          restrictedContributionsCount: 0,
        } satisfies YearContributions,
        24 * 3600,
      );
      return [null];
    };

    // Años ya cacheados de pasadas anteriores → no se vuelven a pedir
    const cachedYears = await Promise.all(
      ranges.map((range) => getCachedJson<YearContributions>(yearKey(range))),
    );
    const missingRanges = ranges.filter((_, i) => !cachedYears[i]);

    const [profilePayload, fetchedBatches] = await Promise.all([
      graphqlRequest<AdventurerProfileResponse>(token, PROFILE_QUERY, {
        login: username,
      }),
      mapWithConcurrency(
        chunk(missingRanges, YEARS_PER_BATCH),
        MAX_CONCURRENT_BATCHES,
        (batch) => fetchYearBatch(batch),
      ),
    ]);

    const user = profilePayload.data?.user;
    if (!user) {
      const message =
        profilePayload.errors?.[0]?.message ?? 'Respuesta inesperada de GitHub';
      throw new GitHubServiceError('api-error', message);
    }

    // Cachear los años recién obtenidos: históricos 7d, año en curso 6h
    const fetched = fetchedBatches.flat();
    await Promise.all(
      missingRanges.map((range, i) => {
        const year = fetched[i];
        if (!year) return Promise.resolve();
        const ttl = range === lastRange ? 6 * 3600 : 7 * 24 * 3600;
        return putCachedJson(yearKey(range), year, ttl);
      }),
    );

    const allYears = ranges.map((range, i) => {
      const cachedYear = cachedYears[i];
      if (cachedYear) return cachedYear;
      const missingIndex = missingRanges.indexOf(range);
      return missingIndex >= 0 ? (fetched[missingIndex] ?? null) : null;
    });
    const obtained = allYears.filter((y): y is YearContributions => Boolean(y));
    const lifetime = sumYearContributions(obtained);
    const incompleteYears = ranges.length - obtained.length;

    const days = user.lastYear.contributionCalendar.weeks.flatMap(
      (w) => w.contributionDays,
    );
    const languages = new Set(
      user.repositories.nodes
        .map((r) => r.primaryLanguage?.name)
        .filter((name): name is string => Boolean(name)),
    );
    const externalMergedPRs = user.lastYear.pullRequestContributionsByRepository
      .filter((c) => c.repository.owner.login.toLowerCase() !== username.toLowerCase())
      .reduce((sum, c) => sum + c.contributions.totalCount, 0);
    const accountAgeYears =
      (Date.now() - new Date(createdAt).getTime()) / (365.25 * 24 * 3600 * 1000);

    return {
      username,
      displayName: user.name,
      ...lifetime,
      totalPullRequests: user.pullRequests.totalCount,
      totalStars: user.repositories.nodes.reduce((s, r) => s + r.stargazerCount, 0),
      followers: user.followers.totalCount,
      ownedRepos: user.repositories.totalCount,
      languageCount: languages.size,
      currentStreak: calculateStreak(days),
      activeDaysLastYear: days.filter((d) => d.contributionCount > 0).length,
      accountAgeYears: Math.floor(accountAgeYears),
      memberSinceYear: new Date(createdAt).getUTCFullYear(),
      externalMergedPRs,
      incompleteYears,
    };
  },
});
