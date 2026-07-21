/** Formatea números grandes de forma compacta: 1234 → "1.2k". */
export const compactNumber = (value: number): string => {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
};

/** Escapa texto para incrustarlo con seguridad dentro de un SVG/XML. */
export const escapeXml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
