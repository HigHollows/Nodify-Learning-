import { describe, expect, it } from "vitest";
import { labelForLevelOrder, levelForXp, progressBar } from "./leveling.js";

describe("levelForXp", () => {
  it("retourne le niveau Beginner (index 0) à 0 XP", () => {
    const level = levelForXp(0);
    expect(level.index).toBe(0);
    expect(level.xpIntoLevel).toBe(0);
    expect(level.xpForNextLevel).toBe(100);
  });

  it("reste au niveau courant juste avant le seuil suivant", () => {
    const level = levelForXp(99);
    expect(level.index).toBe(0);
  });

  it("passe au niveau suivant exactement au seuil", () => {
    const level = levelForXp(100);
    expect(level.index).toBe(1);
    expect(level.xpIntoLevel).toBe(0);
  });

  it("calcule correctement l'XP dans le niveau courant", () => {
    const level = levelForXp(150);
    expect(level.index).toBe(1);
    expect(level.xpIntoLevel).toBe(50); // 150 - seuil(100)
  });

  it("n'a pas de niveau suivant une fois au niveau max (Expert)", () => {
    const level = levelForXp(10_000);
    expect(level.index).toBe(4);
    expect(level.xpForNextLevel).toBeNull();
  });
});

describe("progressBar", () => {
  it("affiche 0% quand current=0", () => {
    expect(progressBar(0, 100)).toBe("▱▱▱▱▱▱▱▱▱▱ 0%");
  });

  it("affiche 100% quand current=target", () => {
    expect(progressBar(100, 100)).toBe("▰▰▰▰▰▰▰▰▰▰ 100%");
  });

  it("ne dépasse jamais 100% même si current > target", () => {
    expect(progressBar(150, 100)).toBe("▰▰▰▰▰▰▰▰▰▰ 100%");
  });

  it("gère un target de 0 sans diviser par zéro", () => {
    expect(progressBar(0, 0)).toBe("▰▰▰▰▰▰▰▰▰▰");
  });
});

describe("labelForLevelOrder", () => {
  it("retourne le nom avec emoji pour un ordre connu", () => {
    expect(labelForLevelOrder(1)).toContain("Beginner");
    expect(labelForLevelOrder(5)).toContain("Expert");
  });

  it("retourne un fallback pour un ordre inconnu", () => {
    expect(labelForLevelOrder(99)).toBe("Niveau 99");
  });
});
