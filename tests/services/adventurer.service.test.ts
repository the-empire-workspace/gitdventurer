import { describe, expect, it } from 'vitest';
import { CLASSES } from '../../src/config/classes.config';
import { RANKS } from '../../src/config/ranks.config';
import {
  buildAdventurerProfile,
  calculateAttributes,
  calculateLevel,
  calculateTotalXp,
  resolveAchievements,
  resolveClass,
  resolveClassTitle,
  resolveRank,
  resolveSkill,
} from '../../src/services/adventurer.service';
import type { Attributes, GitHubMetrics } from '../../src/types';

/** Métricas base neutras; cada test sobrescribe lo que le interesa. */
const baseMetrics = (overrides: Partial<GitHubMetrics> = {}): GitHubMetrics => ({
  username: 'test-user',
  displayName: 'Test User',
  totalCommits: 0,
  privateContributions: 0,
  totalPullRequests: 0,
  totalReviews: 0,
  totalIssues: 0,
  totalStars: 0,
  followers: 0,
  ownedRepos: 0,
  languageCount: 0,
  currentStreak: 0,
  activeDaysLastYear: 0,
  accountAgeYears: 0,
  memberSinceYear: 2020,
  externalMergedPRs: 0,
  incompleteYears: 0,
  ...overrides,
});

describe('calculateAttributes', () => {
  it('devuelve 0 en todo para una cuenta vacía', () => {
    const attrs = calculateAttributes(baseMetrics());
    expect(Object.values(attrs)).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('satura en 100 al alcanzar el umbral de saturación (lifetime)', () => {
    const attrs = calculateAttributes(
      baseMetrics({ totalCommits: 25000, currentStreak: 100 }),
    );
    expect(attrs.STR).toBe(100);
    expect(attrs.DEX).toBe(100);
  });

  it('nunca supera 100 aunque la métrica sea gigante', () => {
    const attrs = calculateAttributes(baseMetrics({ totalCommits: 1_000_000 }));
    expect(attrs.STR).toBe(100);
  });

  it('la escala logarítmica premia el arranque: la mitad del umbral da mucho más de 50', () => {
    const attrs = calculateAttributes(baseMetrics({ totalCommits: 12500 }));
    expect(attrs.STR).toBeGreaterThan(80);
    expect(attrs.STR).toBeLessThan(100);
  });
});

describe('resolveClass', () => {
  it('asigna Guerrero cuando dominan los commits (STR)', () => {
    const attrs = calculateAttributes(baseMetrics({ totalCommits: 4000 }));
    expect(resolveClass(attrs).id).toBe('warrior');
  });

  it('asigna Paladín cuando dominan las reviews (WIS)', () => {
    const attrs = calculateAttributes(
      baseMetrics({ totalReviews: 250, totalCommits: 10 }),
    );
    expect(resolveClass(attrs).id).toBe('paladin');
  });

  it('asigna Mago cuando dominan stars/followers (CHA)', () => {
    const attrs = calculateAttributes(
      baseMetrics({ totalStars: 1500, followers: 300 }),
    );
    expect(resolveClass(attrs).id).toBe('mage');
  });

  it('en empate total gana la primera clase del registro (orden estable)', () => {
    const attrs = calculateAttributes(baseMetrics());
    expect(resolveClass(attrs).id).toBe('warrior');
  });
});

describe('calculateTotalXp / calculateLevel', () => {
  it('una cuenta vacía es nivel 1 con 0 XP', () => {
    const info = calculateLevel(baseMetrics());
    expect(info).toEqual({ level: 1, currentXp: 0, nextLevelXp: 20 });
  });

  it('las contribuciones privadas dan la misma XP que los commits', () => {
    const publicXp = calculateTotalXp(baseMetrics({ totalCommits: 500 }));
    const privateXp = calculateTotalXp(baseMetrics({ privateContributions: 500 }));
    expect(privateXp).toBe(publicXp);
  });

  it('pondera reviews por encima de PRs y commits', () => {
    const xpReviews = calculateTotalXp(baseMetrics({ totalReviews: 10 }));
    const xpPRs = calculateTotalXp(baseMetrics({ totalPullRequests: 10 }));
    const xpCommits = calculateTotalXp(baseMetrics({ totalCommits: 10 }));
    expect(xpReviews).toBeGreaterThan(xpPRs);
    expect(xpPRs).toBeGreaterThan(xpCommits);
  });

  it('sube de nivel al cruzar el umbral de XP', () => {
    // 100 XP: nivel 2 cuesta 20, nivel 3 cuesta 60 (acum. 80), nivel 4 pide 100 más
    const info = calculateLevel(baseMetrics({ totalCommits: 100 }));
    expect(info.level).toBe(3);
    expect(info.currentXp).toBe(20); // 100 - 80
    expect(info.nextLevelXp).toBe(100); // 20 * (2·3 - 1)
  });

  it('un dev con ~4.2k contribuciones de por vida alcanza rango Plata', () => {
    const info = calculateLevel(
      baseMetrics({ totalCommits: 1200, privateContributions: 3000 }),
    );
    expect(info.level).toBeGreaterThanOrEqual(15); // Plata
    expect(info.level).toBeLessThan(30); // pero no Oro
  });

  it('el nivel crece de forma sublineal con la XP', () => {
    const small = calculateLevel(baseMetrics({ totalCommits: 1000 }));
    const big = calculateLevel(baseMetrics({ totalCommits: 100_000 }));
    expect(big.level).toBeGreaterThan(small.level);
    expect(big.level).toBeLessThan(small.level * 100); // no lineal
  });
});

describe('resolveRank', () => {
  it.each([
    [1, 'bronze'],
    [14, 'bronze'],
    [15, 'silver'],
    [30, 'gold'],
    [50, 'platinum'],
    [75, 'legend'],
    [999, 'legend'],
  ])('nivel %i → rango %s', (level, expected) => {
    expect(resolveRank(level).id).toBe(expected);
  });
});

describe('resolveAchievements', () => {
  it('una cuenta vacía no desbloquea nada', () => {
    expect(resolveAchievements(baseMetrics())).toEqual([]);
  });

  it('desbloquea el slayer de commits a partir de 1000', () => {
    const unlocked = resolveAchievements(baseMetrics({ totalCommits: 1000 }));
    expect(unlocked.map((a) => a.id)).toContain('commit-slayer-1000');
  });

  it('puede desbloquear varios a la vez', () => {
    const unlocked = resolveAchievements(
      baseMetrics({ totalCommits: 2000, currentStreak: 45, languageCount: 6 }),
    );
    expect(unlocked.length).toBeGreaterThanOrEqual(3);
  });
});

describe('resolveClassTitle', () => {
  it('en Bronce el Guerrero es Escudero', () => {
    expect(resolveClassTitle(CLASSES.warrior, RANKS[0]!)).toBe('Escudero');
  });

  it('en Leyenda el Guerrero es Señor de la Guerra', () => {
    expect(resolveClassTitle(CLASSES.warrior, RANKS[4]!)).toBe('Señor de la Guerra');
  });

  it('cada rango da un título distinto para la misma clase', () => {
    const titles = RANKS.map((r) => resolveClassTitle(CLASSES.mage, r));
    expect(new Set(titles).size).toBe(RANKS.length);
  });
});

describe('resolveSkill', () => {
  const attrs = (overrides: Partial<Attributes>): Attributes => ({
    STR: 0, DEX: 0, INT: 0, WIS: 0, CHA: 0, VIT: 0,
    ...overrides,
  });

  it('STR+INT dominantes → Forja Arcana', () => {
    expect(resolveSkill(attrs({ STR: 90, INT: 70 })).name).toBe('Forja Arcana');
  });

  it('el orden del par no importa (INT alto y STR segundo dan lo mismo)', () => {
    const a = resolveSkill(attrs({ STR: 90, INT: 70 }));
    const b = resolveSkill(attrs({ INT: 90, STR: 70 }));
    expect(a.id).toBe(b.id);
  });

  it('siempre devuelve una habilidad, incluso con todo en 0', () => {
    expect(resolveSkill(attrs({}))).toBeDefined();
  });
});

describe('buildAdventurerProfile', () => {
  it('compone el perfil completo de forma coherente', () => {
    const profile = buildAdventurerProfile(
      baseMetrics({
        totalCommits: 3000,
        totalPullRequests: 150,
        totalReviews: 80,
        totalStars: 200,
        followers: 50,
        languageCount: 6,
        currentStreak: 12,
        accountAgeYears: 4,
      }),
    );
    expect(profile.username).toBe('test-user');
    expect(profile.displayName).toBe('Test User');
    expect(profile.adventurerClass.id).toBe('warrior');
    expect(profile.levelInfo.level).toBeGreaterThan(1);
    expect(profile.rank.minLevel).toBeLessThanOrEqual(profile.levelInfo.level);
    expect(profile.achievements.length).toBeGreaterThan(0);
    // El título corresponde al tier de su rango actual
    expect(profile.adventurerClass.tiers).toContain(profile.classTitle);
    expect(profile.skill.name).toBeTruthy();
  });

  it('usa el username como displayName cuando GitHub no da nombre', () => {
    const profile = buildAdventurerProfile(baseMetrics({ displayName: null }));
    expect(profile.displayName).toBe('test-user');
  });
});
