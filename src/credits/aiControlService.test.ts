import { describe, expect, it } from "vitest";
import { deriveAiStatus, type AiStatusInput } from "./aiControlService.js";

const NOW = Date.parse("2026-08-05T12:00:00.000Z");

function baseConfig(overrides: Partial<AiStatusInput> = {}): AiStatusInput {
  return {
    aiMode: "OPEN",
    lastErrorAt: null,
    lastSuccessfulRequestAt: null,
    lastErrorCode: null,
    ...overrides,
  };
}

describe("deriveAiStatus", () => {
  it("mode CLOSED → OFFLINE, peu importe la télémétrie", () => {
    expect(deriveAiStatus(baseConfig({ aiMode: "CLOSED" }), NOW)).toBe("OFFLINE");
  });

  it("mode MAINTENANCE → MAINTENANCE", () => {
    expect(deriveAiStatus(baseConfig({ aiMode: "MAINTENANCE" }), NOW)).toBe("MAINTENANCE");
  });

  it("mode LIMITED → LIMITED", () => {
    expect(deriveAiStatus(baseConfig({ aiMode: "LIMITED" }), NOW)).toBe("LIMITED");
  });

  it("mode OPEN sans aucune télémétrie → OPERATIONAL", () => {
    expect(deriveAiStatus(baseConfig(), NOW)).toBe("OPERATIONAL");
  });

  it("mode OPEN, dernier succès après la dernière erreur → OPERATIONAL", () => {
    const config = baseConfig({
      lastErrorAt: new Date(NOW - 60_000),
      lastSuccessfulRequestAt: new Date(NOW - 1_000),
      lastErrorCode: "PROVIDER_ERROR",
    });
    expect(deriveAiStatus(config, NOW)).toBe("OPERATIONAL");
  });

  it("erreur récente (< 10 min) avec code QUOTA → QUOTA", () => {
    const config = baseConfig({ lastErrorAt: new Date(NOW - 60_000), lastErrorCode: "QUOTA" });
    expect(deriveAiStatus(config, NOW)).toBe("QUOTA");
  });

  it("erreur récente (< 10 min) sans code QUOTA → ERROR", () => {
    const config = baseConfig({ lastErrorAt: new Date(NOW - 60_000), lastErrorCode: "TIMEOUT" });
    expect(deriveAiStatus(config, NOW)).toBe("ERROR");
  });

  it("erreur entre 10 et 30 min → DEGRADED (fenêtre plus large, moins sévère)", () => {
    const config = baseConfig({ lastErrorAt: new Date(NOW - 15 * 60_000), lastErrorCode: "QUOTA" });
    expect(deriveAiStatus(config, NOW)).toBe("DEGRADED");
  });

  it("erreur au-delà de 30 min → OPERATIONAL (n'affecte plus le statut affiché)", () => {
    const config = baseConfig({ lastErrorAt: new Date(NOW - 45 * 60_000) });
    expect(deriveAiStatus(config, NOW)).toBe("OPERATIONAL");
  });

  it("succès plus récent que l'erreur, même après une erreur QUOTA → OPERATIONAL", () => {
    const config = baseConfig({
      lastErrorAt: new Date(NOW - 5 * 60_000),
      lastSuccessfulRequestAt: new Date(NOW - 1 * 60_000),
      lastErrorCode: "QUOTA",
    });
    expect(deriveAiStatus(config, NOW)).toBe("OPERATIONAL");
  });
});
