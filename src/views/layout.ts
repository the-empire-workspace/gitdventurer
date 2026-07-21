/**
 * Layout centralizado de la tarjeta (500×300). Todas las vistas y
 * componentes derivan posiciones de aquí — sin números mágicos repartidos.
 */
export const LAYOUT = {
  width: 500,
  height: 300,
  /** Margen lateral del contenido. */
  marginX: 28,
  /** Cabecera (medallón + nombres). */
  headerY: 26,
  /** Línea divisoria bajo la cabecera. */
  dividerY: 96,
  /** Primera fila de barras de stats. */
  statsY: 118,
  statsRowHeight: 27,
  /** Barra de experiencia. */
  xpY: 226,
  /** Fila de chips (habilidad + logros). */
  badgesY: 254,
  /** Sello del gremio (contiene el nivel). */
  seal: { cx: 444, cy: 56, radius: 30 },
  /** Marca de agua del emblema de clase. */
  watermark: { x: 330, y: 120, scale: 7.5 },
} as const;
