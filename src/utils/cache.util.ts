/** Segundos que una ficha vive en el edge-cache y en caches intermedios. */
export const CARD_TTL_SECONDS = 21600; // 6 horas

/** Busca una respuesta cacheada para esta request en el edge. */
export const getCached = async (request: Request): Promise<Response | undefined> =>
  caches.default.match(request);

/** Lee un JSON del edge-cache por clave sintética. */
export const getCachedJson = async <T>(key: string): Promise<T | null> => {
  const response = await caches.default.match(new Request(key));
  return response ? ((await response.json()) as T) : null;
};

/** Guarda un JSON en el edge-cache con TTL. */
export const putCachedJson = async (
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> => {
  await caches.default.put(
    new Request(key),
    new Response(JSON.stringify(value), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${ttlSeconds}`,
      },
    }),
  );
};

/** Lo mínimo que necesitamos del ExecutionContext (Hono y workers-types difieren). */
interface WaitUntilContext {
  waitUntil(promise: Promise<unknown>): void;
}

/**
 * Guarda la respuesta en el edge-cache sin bloquear la respuesta al cliente.
 * `waitUntil` mantiene vivo el Worker hasta completar la escritura.
 */
export const putCached = (
  ctx: WaitUntilContext,
  request: Request,
  response: Response,
): void => {
  ctx.waitUntil(caches.default.put(request, response.clone()));
};
