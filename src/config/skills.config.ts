import type { AttributeKey, Skill } from '../types';

/**
 * Habilidades por combinación de los 2 atributos más altos (15 pares).
 * La clave es el par ordenado alfabéticamente unido por '+'.
 * Añadir/renombrar una habilidad = tocar solo este registro.
 */
export const SKILLS: Record<string, Skill> = {
  'DEX+STR': { id: 'dex-str', name: 'Danza de Espadas', icon: '🌀' },
  'INT+STR': { id: 'int-str', name: 'Forja Arcana', icon: '🔨' },
  'STR+WIS': { id: 'str-wis', name: 'Golpe Certero', icon: '🎯' },
  'CHA+STR': { id: 'cha-str', name: 'Grito de Guerra', icon: '📣' },
  'STR+VIT': { id: 'str-vit', name: 'Muralla Inquebrantable', icon: '🧱' },
  'DEX+INT': { id: 'dex-int', name: 'Flecha Rúnica', icon: '🏹' },
  'DEX+WIS': { id: 'dex-wis', name: 'Parada Perfecta', icon: '⚡' },
  'CHA+DEX': { id: 'cha-dex', name: 'Paso Sombrío', icon: '🌙' },
  'DEX+VIT': { id: 'dex-vit', name: 'Resistencia Férrea', icon: '⛓️' },
  'INT+WIS': { id: 'int-wis', name: 'Ojo Omnisciente', icon: '👁️' },
  'CHA+INT': { id: 'cha-int', name: 'Elocuencia Arcana', icon: '💫' },
  'INT+VIT': { id: 'int-vit', name: 'Memoria Ancestral', icon: '📖' },
  'CHA+WIS': { id: 'cha-wis', name: 'Voz del Oráculo', icon: '🔮' },
  'VIT+WIS': { id: 'vit-wis', name: 'Guardián Eterno', icon: '🗿' },
  'CHA+VIT': { id: 'cha-vit', name: 'Leyenda Viva', icon: '🌟' },
};

/** Clave canónica del par de atributos (orden alfabético). */
export const skillKey = (a: AttributeKey, b: AttributeKey): string =>
  [a, b].sort().join('+');
