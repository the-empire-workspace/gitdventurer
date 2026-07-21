import type { AdventurerClass, ClassId } from '../types';

/**
 * Registro de clases de aventurero. La clase se asigna según el atributo
 * dominante del usuario. Añadir una clase = añadir una entrada aquí.
 */
export const CLASSES: Record<ClassId, AdventurerClass> = {
  warrior: {
    id: 'warrior',
    name: 'Guerrero',
    dominantAttribute: 'STR',
    tiers: ['Escudero', 'Guerrero', 'Caballero', 'Campeón', 'Señor de la Guerra'],
    // Espada
    emblemPath:
      'M6.92 5H5l9 9 1-.94m4.96 6.06-.84.84a1 1 0 0 1-1.41 0l-3.12-3.12-2.68 2.66-1.41-1.41 1.42-1.42L3 7.75V3h4.75l8.92 8.92 1.42-1.42 1.41 1.41-2.67 2.67 3.12 3.12a1 1 0 0 1 0 1.42Z',
  },
  ranger: {
    id: 'ranger',
    name: 'Explorador',
    dominantAttribute: 'INT',
    tiers: ['Rastreador', 'Explorador', 'Cazador', 'Maestro Cartógrafo', 'Señor de los Caminos'],
    // Brújula
    emblemPath:
      'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3.5-11.5-2 5-5 2 2-5 5-2Z',
  },
  paladin: {
    id: 'paladin',
    name: 'Paladín',
    dominantAttribute: 'WIS',
    tiers: ['Acólito', 'Protector', 'Paladín', 'Cruzado', 'Avatar de la Justicia'],
    // Escudo
    emblemPath:
      'M12 2 4 5.5V11c0 5.05 3.41 9.76 8 11 4.59-1.24 8-5.95 8-11V5.5L12 2Zm0 2.18 6 2.63V11c0 4.07-2.63 7.93-6 9.09-3.37-1.16-6-5.02-6-9.09V6.81l6-2.63Z',
  },
  mage: {
    id: 'mage',
    name: 'Mago',
    dominantAttribute: 'CHA',
    tiers: ['Aprendiz', 'Hechicero', 'Mago', 'Archimago', 'Gran Archimago'],
    // Estrella/chispa arcana
    emblemPath:
      'M12 1.5 14.09 8.4l6.91.1-5.55 4.13 2.04 6.87L12 15.4l-5.49 4.1 2.04-6.87L3 8.5l6.91-.1L12 1.5Z',
  },
  alchemist: {
    id: 'alchemist',
    name: 'Alquimista',
    dominantAttribute: 'DEX',
    tiers: ['Boticario', 'Alquimista', 'Maestro Alquimista', 'Transmutador', 'Gran Transmutador'],
    // Matraz
    emblemPath:
      'M9 2h6v2h-1v4.6l4.7 8.16A2 2 0 0 1 16.96 20H7.04a2 2 0 0 1-1.74-3.24L10 8.6V4H9V2Zm3 8.24L8.3 16h7.4L12 10.24Z',
  },
  bard: {
    id: 'bard',
    name: 'Bardo',
    dominantAttribute: 'VIT',
    tiers: ['Juglar', 'Trovador', 'Bardo', 'Virtuoso', 'Voz de los Reinos'],
    // Lira/nota
    emblemPath:
      'M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Zm-2 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
  },
};

export const CLASS_LIST: AdventurerClass[] = Object.values(CLASSES);
