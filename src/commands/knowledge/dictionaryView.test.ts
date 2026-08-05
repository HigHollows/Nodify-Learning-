import { describe, expect, it } from "vitest";
import { parseExplainCustomId } from "./dictionaryView.js";

describe("parseExplainCustomId", () => {
  it("parse un customId valide avec niveau 'beginner'", () => {
    expect(parseExplainCustomId("dictionary:explain:jwt:beginner")).toEqual({
      key: "jwt",
      level: "beginner",
    });
  });

  it("parse un customId valide avec niveau 'advanced'", () => {
    expect(parseExplainCustomId("dictionary:explain:promise:advanced")).toEqual({
      key: "promise",
      level: "advanced",
    });
  });

  it("retourne null pour un namespace différent", () => {
    expect(parseExplainCustomId("academy:explain:jwt:beginner")).toBeNull();
  });

  it("retourne null pour un niveau invalide", () => {
    expect(parseExplainCustomId("dictionary:explain:jwt:expert")).toBeNull();
  });

  it("retourne null si le nombre de segments est incorrect", () => {
    expect(parseExplainCustomId("dictionary:explain:jwt")).toBeNull();
  });
});
