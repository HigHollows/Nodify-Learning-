import { describe, expect, it } from "vitest";
import { formatCredits, formatDuration } from "./container.js";

describe("formatCredits", () => {
  it("met un pluriel au-delà de 1", () => {
    expect(formatCredits(5)).toBe("5 crédits");
  });

  it("reste au singulier pour 0, 1 et -1 (règle grammaticale française)", () => {
    expect(formatCredits(0)).toBe("0 crédit");
    expect(formatCredits(1)).toBe("1 crédit");
    expect(formatCredits(-1)).toBe("-1 crédit");
  });
});

describe("formatDuration", () => {
  it("retourne 'maintenant' si la durée est écoulée ou négative", () => {
    expect(formatDuration(0)).toBe("maintenant");
    expect(formatDuration(-1000)).toBe("maintenant");
  });

  it("affiche seulement des minutes en dessous d'une heure", () => {
    expect(formatDuration(30 * 60 * 1000)).toBe("30min");
  });

  it("affiche heures + minutes au-delà d'une heure", () => {
    expect(formatDuration(90 * 60 * 1000)).toBe("1h 30min");
  });

  it("arrondit au-dessus pour ne jamais afficher 0min alors que du temps reste", () => {
    expect(formatDuration(1)).toBe("1min");
  });
});
