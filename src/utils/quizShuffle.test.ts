import { describe, expect, it } from "vitest";
import { shuffleChoices } from "./quizShuffle.js";

describe("shuffleChoices", () => {
  it("est déterministe : la même clé donne toujours le même résultat", () => {
    const a = shuffleChoices("q1", ["A", "B", "C", "D"], 1);
    const b = shuffleChoices("q1", ["A", "B", "C", "D"], 1);
    expect(a).toEqual(b);
  });

  it("des clés différentes donnent généralement des ordres différents", () => {
    const a = shuffleChoices("q1", ["A", "B", "C", "D"], 1);
    const b = shuffleChoices("q2", ["A", "B", "C", "D"], 1);
    expect(a.choices).not.toEqual(b.choices);
  });

  it("la bonne réponse (le texte) reste correcte après mélange", () => {
    const choices = ["Paris", "Londres", "Berlin", "Madrid"];
    const { choices: shuffled, correctIndex } = shuffleChoices("capitale", choices, 0);
    expect(shuffled[correctIndex]).toBe("Paris");
  });

  it("garde le même ensemble de choix, juste réordonné", () => {
    const choices = ["A", "B", "C", "D"];
    const { choices: shuffled } = shuffleChoices("q3", choices, 2);
    expect([...shuffled].sort()).toEqual([...choices].sort());
  });

  it("fonctionne avec seulement 2 choix (quiz Academy)", () => {
    const { choices: shuffled, correctIndex } = shuffleChoices("lesson1:1", ["Vrai", "Faux"], 1);
    expect(shuffled[correctIndex]).toBe("Faux");
    expect(shuffled).toHaveLength(2);
  });

  it("la distribution du nouvel index n'est pas systématiquement la même position sur beaucoup de clés", () => {
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < 200; i++) {
      const { correctIndex } = shuffleChoices(`key-${i}`, ["A", "B", "C", "D"], 1);
      counts[correctIndex]!++;
    }
    // Sur 200 tirages avec 4 positions, aucune position ne devrait dominer à >80% (le bug qu'on corrige).
    for (const count of counts) {
      expect(count).toBeLessThan(160);
    }
  });
});
