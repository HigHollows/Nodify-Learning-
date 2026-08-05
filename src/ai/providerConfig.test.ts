import { beforeEach, describe, expect, it, vi } from "vitest";

const overrides: { AI_FEATURE_PROVIDER_OVERRIDES?: string; AI_PROVIDER_COST_MULTIPLIERS?: string } = {};

vi.mock("../config/env.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../config/env.js")>();
  return {
    ...actual,
    get env() {
      return { ...actual.env, ...overrides };
    },
  };
});

const { getFeatureProviderOverrides, getProviderCostMultiplier } = await import("./providerConfig.js");

beforeEach(() => {
  delete overrides.AI_FEATURE_PROVIDER_OVERRIDES;
  delete overrides.AI_PROVIDER_COST_MULTIPLIERS;
});

describe("getFeatureProviderOverrides", () => {
  it("retourne un objet vide si la variable n'est pas définie", () => {
    expect(getFeatureProviderOverrides()).toEqual({});
  });

  it("parse un JSON valide en Record<string, string>", () => {
    overrides.AI_FEATURE_PROVIDER_OVERRIDES = JSON.stringify({ threatmodel: "anthropic" });
    expect(getFeatureProviderOverrides()).toEqual({ threatmodel: "anthropic" });
  });

  it("ignore silencieusement un JSON invalide (ne plante jamais le bot)", () => {
    overrides.AI_FEATURE_PROVIDER_OVERRIDES = "{not valid json";
    expect(getFeatureProviderOverrides()).toEqual({});
  });

  it("ignore les valeurs non-string dans l'objet parsé", () => {
    overrides.AI_FEATURE_PROVIDER_OVERRIDES = JSON.stringify({ threatmodel: 42 });
    expect(getFeatureProviderOverrides()).toEqual({});
  });
});

describe("getProviderCostMultiplier", () => {
  it("retourne 1 par défaut si la variable n'est pas définie", () => {
    expect(getProviderCostMultiplier("anthropic")).toBe(1);
  });

  it("retourne le multiplicateur configuré pour un provider connu", () => {
    overrides.AI_PROVIDER_COST_MULTIPLIERS = JSON.stringify({ anthropic: 1.5 });
    expect(getProviderCostMultiplier("anthropic")).toBe(1.5);
  });

  it("retourne 1 pour un provider non listé dans la config", () => {
    overrides.AI_PROVIDER_COST_MULTIPLIERS = JSON.stringify({ anthropic: 1.5 });
    expect(getProviderCostMultiplier("gemini")).toBe(1);
  });

  it("retourne 1 si la valeur configurée n'est pas un nombre positif", () => {
    overrides.AI_PROVIDER_COST_MULTIPLIERS = JSON.stringify({ anthropic: -1 });
    expect(getProviderCostMultiplier("anthropic")).toBe(1);
  });
});
