import { describe, expect, it } from "vitest";
import { levenshteinDistance, similarity } from "./textDistance.js";

describe("levenshteinDistance", () => {
  it("retourne 0 pour deux chaînes identiques", () => {
    expect(levenshteinDistance("nodify", "nodify")).toBe(0);
  });

  it("retourne la longueur de l'autre chaîne si l'une est vide", () => {
    expect(levenshteinDistance("", "abc")).toBe(3);
    expect(levenshteinDistance("abc", "")).toBe(3);
  });

  it("compte 1 substitution", () => {
    expect(levenshteinDistance("chat", "chat".replace("h", "b"))).toBe(1);
  });

  it("compte 1 insertion", () => {
    expect(levenshteinDistance("cat", "cats")).toBe(1);
  });

  it("gère une faute de frappe réaliste (promise/promiss)", () => {
    expect(levenshteinDistance("promise", "promiss")).toBe(1);
  });
});

describe("similarity", () => {
  it("vaut 1 pour deux chaînes identiques", () => {
    expect(similarity("docker", "docker")).toBe(1);
  });

  it("vaut 1 pour deux chaînes vides", () => {
    expect(similarity("", "")).toBe(1);
  });

  it("est proche de 1 pour une faute de frappe mineure", () => {
    expect(similarity("promise", "promiss")).toBeGreaterThan(0.8);
  });

  it("est faible pour deux mots sans rapport", () => {
    expect(similarity("docker", "xyzzyplugh")).toBeLessThan(0.3);
  });
});
