import { describe, expect, it } from "vitest";
import { classifyProviderError } from "./aiErrorClassifier.js";

describe("classifyProviderError", () => {
  it("classe une erreur avec status 429 en QUOTA", () => {
    const error = Object.assign(new Error("Too Many Requests"), { status: 429 });
    expect(classifyProviderError(error).code).toBe("QUOTA");
  });

  it("classe un message contenant 'quota' en QUOTA même sans status", () => {
    expect(classifyProviderError(new Error("Quota exceeded for this project")).code).toBe("QUOTA");
  });

  it("classe une erreur avec status 401 en INVALID_KEY", () => {
    const error = Object.assign(new Error("Unauthorized"), { status: 401 });
    expect(classifyProviderError(error).code).toBe("INVALID_KEY");
  });

  it("classe une erreur avec status 403 en INVALID_KEY", () => {
    const error = Object.assign(new Error("Permission denied"), { status: 403 });
    expect(classifyProviderError(error).code).toBe("INVALID_KEY");
  });

  it("classe une erreur nommée AbortError en TIMEOUT", () => {
    const error = new Error("The operation was aborted");
    error.name = "AbortError";
    expect(classifyProviderError(error).code).toBe("TIMEOUT");
  });

  it("classe un message 'timed out' en TIMEOUT", () => {
    expect(classifyProviderError(new Error("Request timed out after 30000ms")).code).toBe("TIMEOUT");
  });

  it("classe une erreur réseau (ECONNREFUSED) en NETWORK", () => {
    expect(classifyProviderError(new Error("connect ECONNREFUSED 127.0.0.1:443")).code).toBe("NETWORK");
  });

  it("retombe sur PROVIDER_ERROR pour une erreur générique non reconnue", () => {
    expect(classifyProviderError(new Error("Something unexpected happened")).code).toBe("PROVIDER_ERROR");
  });

  it("gère une valeur qui n'est pas une instance d'Error", () => {
    const classified = classifyProviderError("just a string");
    expect(classified.code).toBe("PROVIDER_ERROR");
    expect(classified.message).toBe("just a string");
  });

  it("tronque un message trop long à 500 caractères (jamais de payload complet loggé)", () => {
    const classified = classifyProviderError(new Error("x".repeat(2000)));
    expect(classified.message.length).toBe(500);
  });
});
