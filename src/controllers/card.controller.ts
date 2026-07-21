import type { Context } from 'hono';
import { resolveProfile } from '../services/card.service';
import { createMockProvider } from '../services/github.mock';
import { createGitHubProvider, GitHubServiceError } from '../services/github.service';
import type { Env } from '../types';
import { CARD_TTL_SECONDS, getCached, putCached } from '../utils/cache.util';
import { renderCardBack } from '../views/back.view';
import { renderCard } from '../views/card.view';
import { renderError } from '../views/error.view';
import { resolveTheme } from '../views/themes/darkFantasy';

const USERNAME_PATTERN = /^[a-zA-Z0-9-]{1,39}$/;

export type CardSide = 'front' | 'back';

const svgResponse = (svg: string, cacheSeconds: number): Response =>
  new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
    },
  });

/**
 * Factory del handler SVG:
 *   GET /card/:username        → frente (ficha del aventurero)
 *   GET /card/:username/back   → reverso (registro del gremio)
 * Responde siempre un SVG (la carta o un error temático) con status 200
 * para que GitHub nunca muestre una imagen rota.
 */
export const cardController =
  (side: CardSide) =>
  async (c: Context<{ Bindings: Env }>): Promise<Response> => {
    const username = c.req.param('username') ?? '';
    const theme = resolveTheme(c.req.query('theme'));
    const isDemo = c.req.query('demo') === '1';

    if (!USERNAME_PATTERN.test(username)) {
      return svgResponse(renderError('Nombre de usuario inválido', theme), 300);
    }

    // Edge-cache: si la carta ya se generó hace <6h, se sirve sin tocar GitHub
    const cached = await getCached(c.req.raw);
    if (cached) return cached;

    const token = c.env.GITHUB_TOKEN;
    if (!isDemo && !token) {
      return svgResponse(
        renderError('Falta configurar GITHUB_TOKEN (o usa ?demo=1)', theme),
        300,
      );
    }

    try {
      const provider = isDemo ? createMockProvider() : createGitHubProvider(token!);
      const { profile, metrics, complete } = await resolveProfile(username, provider);
      const svg =
        side === 'back'
          ? renderCardBack(profile, metrics, theme)
          : renderCard(profile, theme);
      // Carta parcial (faltaron años por límites de GitHub): caché corto
      // para que se complete sola pronto — los años obtenidos quedan cacheados
      const ttl = complete ? CARD_TTL_SECONDS : 120;
      const response = svgResponse(svg, ttl);
      if (complete) putCached(c.executionCtx, c.req.raw, response);
      return response;
    } catch (error) {
      const message =
        error instanceof GitHubServiceError
          ? error.message
          : 'Error inesperado generando la carta';
      // Los errores se cachean poco (60s): los límites secundarios de
      // GitHub suelen expirar en ~1 minuto
      return svgResponse(renderError(message, theme), 60);
    }
  };
