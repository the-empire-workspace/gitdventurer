/**
 * La API de GitHub limita contributionsCollection a rangos de máximo 1 año,
 * así que para obtener la actividad DE POR VIDA la query se construye
 * dinámicamente con un alias por año desde la creación de la cuenta.
 * Flujo: 1) query ligera para createdAt → 2) query completa multi-año.
 */

/** Query previa: solo necesitamos saber cuándo se creó la cuenta. */
export const CREATED_AT_QUERY = /* GraphQL */ `
  query CreatedAt($login: String!) {
    user(login: $login) {
      createdAt
    }
  }
`;

export interface CreatedAtResponse {
  data?: { user: { createdAt: string } | null };
  errors?: Array<{ type?: string; message: string }>;
}

export interface YearRange {
  from: string;
  to: string;
}

/** Máximo de rangos anuales (GitHub existe desde 2008). */
const MAX_YEAR_RANGES = 20;

/** Divide [createdAt, ahora] en rangos de ≤365 días, del más antiguo al actual. */
export const yearRanges = (createdAt: string, now = new Date()): YearRange[] => {
  const ranges: YearRange[] = [];
  let from = new Date(createdAt);
  while (from < now) {
    const to = new Date(
      Math.min(from.getTime() + 365 * 24 * 3600 * 1000, now.getTime()),
    );
    ranges.push({ from: from.toISOString(), to: to.toISOString() });
    from = to;
  }
  return ranges.slice(-MAX_YEAR_RANGES);
};

/** Campos que se suman año a año para los totales de por vida. */
export interface YearContributions {
  totalCommitContributions: number;
  totalPullRequestReviewContributions: number;
  totalIssueContributions: number;
  restrictedContributionsCount: number;
}

/**
 * Máximo de contributionsCollection por request: GitHub responde
 * "Resource limits for this query exceeded" a partir del 4º alias
 * (verificado empíricamente contra la API).
 */
export const YEARS_PER_BATCH = 3;

/** Query de perfil: identidad, repos, PRs/issues de por vida y último año. */
export const PROFILE_QUERY = /* GraphQL */ `
  query AdventurerProfile($login: String!) {
    user(login: $login) {
      name
      createdAt
      followers {
        totalCount
      }
      pullRequests {
        totalCount
      }
      repositories(
        first: 100
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        totalCount
        nodes {
          stargazerCount
          primaryLanguage {
            name
          }
        }
      }
      lastYear: contributionsCollection {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        pullRequestContributionsByRepository(maxRepositories: 100) {
          repository {
            owner {
              login
            }
          }
          contributions {
            totalCount
          }
        }
      }
    }
  }
`;

/** Query de un lote de años: solo los aliases anuales (barata en recursos). */
export const buildYearsQuery = (ranges: YearRange[]): string => {
  const yearAliases = ranges
    .map(
      (r, i) => `
      y${i}: contributionsCollection(from: "${r.from}", to: "${r.to}") {
        totalCommitContributions
        totalPullRequestReviewContributions
        totalIssueContributions
        restrictedContributionsCount
      }`,
    )
    .join('');

  return /* GraphQL */ `
    query AdventurerYears($login: String!) {
      user(login: $login) {
        ${yearAliases}
      }
    }
  `;
};

/** Forma de la respuesta de la query de perfil (solo campos usados). */
export interface AdventurerProfileResponse {
  data?: {
    user: {
      name: string | null;
      createdAt: string;
      followers: { totalCount: number };
      pullRequests: { totalCount: number };
      repositories: {
        totalCount: number;
        nodes: Array<{
          stargazerCount: number;
          primaryLanguage: { name: string } | null;
        }>;
      };
      lastYear: {
        contributionCalendar: {
          weeks: Array<{
            contributionDays: Array<{
              date: string;
              contributionCount: number;
            }>;
          }>;
        };
        pullRequestContributionsByRepository: Array<{
          repository: { owner: { login: string } };
          contributions: { totalCount: number };
        }>;
      };
    } | null;
  };
  errors?: Array<{ type?: string; message: string }>;
}

/** Forma de la respuesta de un lote de años. */
export interface AdventurerYearsResponse {
  data?: {
    user: Record<`y${number}`, YearContributions> | null;
  };
  errors?: Array<{ type?: string; message: string }>;
}
