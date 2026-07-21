import type { Theme } from '../../types';

/** Theme por defecto: dark fantasy moderno con acentos dorados. */
export const darkFantasy: Theme = {
  id: 'dark-fantasy',
  backgroundGradient: ['#0d1117', '#1a1035'],
  surface: '#161b2e',
  border: '#2d2a4a',
  textPrimary: '#e6e1f5',
  textSecondary: '#8b87a8',
  accent: '#f5c542',
  accentSoft: '#f5c54233',
  barTrack: '#25213d',
  fontFamily:
    "'Segoe UI', 'Helvetica Neue', -apple-system, system-ui, sans-serif",
  ornament: '#8a7440',
  textureOpacity: 0.05,
  watermarkOpacity: 0.055,
};

/** Registro de themes: añadir uno = añadir una entrada. */
export const THEMES: Record<string, Theme> = {
  [darkFantasy.id]: darkFantasy,
};

export const resolveTheme = (id: string | undefined): Theme =>
  (id && THEMES[id]) || darkFantasy;
