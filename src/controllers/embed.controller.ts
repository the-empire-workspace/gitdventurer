import type { Context } from 'hono';
import { resolveProfile } from '../services/card.service';
import { createMockProvider } from '../services/github.mock';
import { createGitHubProvider, GitHubServiceError } from '../services/github.service';
import type { Env } from '../types';
import { CARD_TTL_SECONDS, getCached, putCached } from '../utils/cache.util';
import { renderEmbed, renderEmbedError } from '../views/embed.view';
import { renderError } from '../views/error.view';
import { resolveTheme } from '../views/themes/darkFantasy';

const USERNAME_PATTERN = /^[a-zA-Z0-9-]{1,39}$/;

const htmlResponse = (html: string, cacheSeconds: number): Response =>
  new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}`,
    },
  });

/**
 * GET /card/:username/embed?theme=dark-fantasy&demo=1
 * Página HTML autocontenida con la tarjeta en 3D (tilt + parallax + brillo)
 * pensada para <iframe> en sitios web. Mismo pipeline de datos y caché
 * que el SVG; los errores se sirven como SVG temático envuelto en HTML.
 */
export const embedController = async (
  c: Context<{ Bindings: Env }>,
): Promise<Response> => {
  const username = c.req.param('username') ?? '';
  const theme = resolveTheme(c.req.query('theme'));
  const isDemo = c.req.query('demo') === '1';

  if (!USERNAME_PATTERN.test(username)) {
    return htmlResponse(
      renderEmbedError(renderError('Nombre de usuario inválido', theme)),
      300,
    );
  }

  const cached = await getCached(c.req.raw);
  if (cached) return cached;

  const token = c.env.GITHUB_TOKEN;
  if (!isDemo && !token) {
    return htmlResponse(
      renderEmbedError(renderError('Falta configurar GITHUB_TOKEN (o usa ?demo=1)', theme)),
      300,
    );
  }

  try {
    const provider = isDemo ? createMockProvider() : createGitHubProvider(token!);
    const { profile, metrics, complete } = await resolveProfile(username, provider);
    const ttl = complete ? CARD_TTL_SECONDS : 120;
    const response = htmlResponse(renderEmbed(profile, metrics, theme), ttl);
    if (complete) putCached(c.executionCtx, c.req.raw, response);
    return response;
  } catch (error) {
    const message =
      error instanceof GitHubServiceError
        ? error.message
        : 'Error inesperado generando la carta';
    return htmlResponse(renderEmbedError(renderError(message, theme)), 60);
  }
};
