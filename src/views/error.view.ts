import type { Theme } from '../types';
import { escapeXml } from '../utils/format.util';

const WIDTH = 500;
const HEIGHT = 120;

/**
 * SVG de error temático: se devuelve con status 200 para que GitHub
 * muestre la tarjeta en lugar de un icono de imagen rota.
 */
export const renderError = (message: string, theme: Theme): string => `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}"
  role="img" aria-label="Error">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${theme.backgroundGradient[0]}" />
      <stop offset="100%" stop-color="${theme.backgroundGradient[1]}" />
    </linearGradient>
  </defs>
  <rect x="1.5" y="1.5" width="${WIDTH - 3}" height="${HEIGHT - 3}" rx="14"
    fill="url(#bg)" stroke="#8b3a3a" stroke-width="1.5" />
  <text x="28" y="52" font-family="${theme.fontFamily}" font-size="16"
    font-weight="700" fill="${theme.textPrimary}">💀 La misión ha fracasado</text>
  <text x="28" y="80" font-family="${theme.fontFamily}" font-size="12"
    fill="${theme.textSecondary}">${escapeXml(message)}</text>
</svg>`;
