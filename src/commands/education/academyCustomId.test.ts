import { describe, expect, it } from "vitest";
import { parseAcademyCustomId } from "./academyCustomId.js";

describe("parseAcademyCustomId", () => {
  it("retourne null pour un customId hors namespace academy", () => {
    expect(parseAcademyCustomId("dictionary:search")).toBeNull();
  });

  it("parse 'list'", () => {
    expect(parseAcademyCustomId("academy:list")).toEqual({ type: "list" });
  });

  it("parse 'start' avec la clé du cours", () => {
    expect(parseAcademyCustomId("academy:start:js-intro")).toEqual({
      type: "start",
      courseKey: "js-intro",
    });
  });

  it("parse 'answer' avec tous les champs numériques convertis", () => {
    expect(parseAcademyCustomId("academy:answer:abc123:2:1:3")).toEqual({
      type: "answer",
      lessonId: "abc123",
      questionOrder: 2,
      runningCorrect: 1,
      choiceIndex: 3,
    });
  });

  it("retourne null si un segment requis manque ('start' sans clé)", () => {
    expect(parseAcademyCustomId("academy:start:")).toBeNull();
  });

  it("retourne null pour une action inconnue", () => {
    expect(parseAcademyCustomId("academy:teleport:abc")).toBeNull();
  });
});
