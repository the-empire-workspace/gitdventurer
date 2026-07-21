/** Restringe un valor al rango [min, max]. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/**
 * Normaliza un valor a 0–100 en escala logarítmica.
 * `saturation` es el valor con el que se alcanza 100 (p. ej. 5000 commits).
 * La escala log evita que cuentas enormes aplasten al resto.
 */
export const logScale = (value: number, saturation: number): number => {
  if (value <= 0) return 0;
  const score = (Math.log10(1 + value) / Math.log10(1 + saturation)) * 100;
  return Math.round(clamp(score, 0, 100));
};
