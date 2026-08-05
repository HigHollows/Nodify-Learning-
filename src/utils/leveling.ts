import { LEVEL_ROLES } from "../setup/resources.js";

/**
 * Seuils d'XP par niveau, alignés en position sur LEVEL_ROLES (setup/resources.ts)
 * pour ne pas dupliquer les noms/emojis de niveau à deux endroits différents.
 * Index 0 = Beginner, ... Index 4 = Expert.
 */
const XP_THRESHOLDS = [0, 100, 500, 1500, 4000] as const;

const LEVELS = [...LEVEL_ROLES].sort((a, b) => a.order - b.order);

export interface LevelInfo {
  name: string;
  index: number;
  /** XP accumulée depuis le début du niveau actuel. */
  xpIntoLevel: number;
  /** XP totale nécessaire pour passer au niveau suivant, ou null si niveau max. */
  xpForNextLevel: number | null;
}

/** Calcule le niveau correspondant à un total d'XP donné. */
export function levelForXp(xp: number): LevelInfo {
  let levelIndex = 0;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (xp >= XP_THRESHOLDS[i]!) levelIndex = i;
  }

  const level = LEVELS[levelIndex]!;
  const floor = XP_THRESHOLDS[levelIndex]!;
  const nextThreshold = XP_THRESHOLDS[levelIndex + 1];

  return {
    name: level.name,
    index: levelIndex,
    xpIntoLevel: xp - floor,
    xpForNextLevel: nextThreshold !== undefined ? nextThreshold - floor : null,
  };
}

/** Barre de progression textuelle simple, ex: "▰▰▰▰▱▱▱▱▱▱ 40%". */
export function progressBar(current: number, target: number, size = 10): string {
  if (target <= 0) return "▰".repeat(size);
  const ratio = Math.min(1, Math.max(0, current / target));
  const filled = Math.round(ratio * size);
  return "▰".repeat(filled) + "▱".repeat(size - filled) + ` ${Math.round(ratio * 100)}%`;
}

/**
 * Nom affichable (avec emoji) pour un niveau de difficulté, réutilisé par
 * le Knowledge Engine (concepts) en plus des rôles/skills — un seul
 * référentiel de niveaux dans tout Nodify.
 * `order` va de 1 (Beginner) à 5 (Expert), voir LEVEL_ROLES.
 */
export function labelForLevelOrder(order: number): string {
  return LEVELS.find((l) => l.order === order)?.name ?? `Niveau ${order}`;
}
