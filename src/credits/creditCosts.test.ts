import { describe, expect, it } from "vitest";
import { getCreditCost, getFeatureLabel, listAiCosts } from "./creditCosts.js";

describe("getCreditCost", () => {
  it("retourne le coût configuré pour une feature connue", () => {
    expect(getCreditCost("explainme")).toBe(1);
    expect(getCreditCost("securityreview")).toBe(3);
  });

  it("retourne un coût par défaut (fail-safe, pas gratuit) pour une feature inconnue", () => {
    expect(getCreditCost("feature-inexistante")).toBe(1);
  });
});

describe("getFeatureLabel", () => {
  it("retourne le libellé configuré pour une feature connue", () => {
    expect(getFeatureLabel("codereview")).toBe("Code Review");
  });

  it("retourne la clé brute en fallback pour une feature inconnue", () => {
    expect(getFeatureLabel("feature-inexistante")).toBe("feature-inexistante");
  });
});

describe("listAiCosts", () => {
  it("liste toutes les features avec leur label et leur coût", () => {
    const costs = listAiCosts();
    expect(costs.length).toBeGreaterThan(0);
    for (const c of costs) {
      expect(c.cost).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
    }
  });
});
