import { describe, expect, it } from "vitest";
import {
  extractChannelId,
  extractUserId,
  getBooleanOption,
  getChoiceOption,
  getIntOption,
  getRequiredIntOption,
  getRequiredStringOption,
  parsePrefixArgs,
  tokenize,
} from "./parseArgs.js";
import { ValidationError } from "../utils/errors.js";

describe("tokenize", () => {
  it("découpe sur les espaces", () => {
    expect(tokenize("give montant:100 raison:test")).toEqual(["give", "montant:100", "raison:test"]);
  });

  it("garde une valeur entre guillemets comme un seul token, guillemets retirés", () => {
    expect(tokenize('give raison:"Participation au CTF"')).toEqual(["give", "raison:Participation au CTF"]);
  });

  it("gère plusieurs valeurs entre guillemets dans la même commande", () => {
    expect(tokenize('close raison:"maintenance planifiée" autre:"deux mots"')).toEqual([
      "close",
      "raison:maintenance planifiée",
      "autre:deux mots",
    ]);
  });

  it("ignore les espaces superflus", () => {
    expect(tokenize("  give   montant:100  ")).toEqual(["give", "montant:100"]);
  });

  it("retourne un tableau vide pour une chaîne vide", () => {
    expect(tokenize("")).toEqual([]);
  });
});

describe("parsePrefixArgs", () => {
  it("détecte la sous-commande (premier token sans ':')", () => {
    const parsed = parsePrefixArgs(["give", "montant:100"]);
    expect(parsed.subcommand).toBe("give");
    expect(parsed.options).toEqual({ montant: "100" });
  });

  it("n'a pas de sous-commande si le premier token contient déjà ':'", () => {
    const parsed = parsePrefixArgs(["academy:true", "cyber:false"]);
    expect(parsed.subcommand).toBeNull();
    expect(parsed.options).toEqual({ academy: "true", cyber: "false" });
  });

  it("ignore un token mal formé (sans ':') après la sous-commande", () => {
    const parsed = parsePrefixArgs(["give", "montant:100", "n'importe quoi"]);
    expect(parsed.options).toEqual({ montant: "100" });
  });

  it("les clés sont insensibles à la casse", () => {
    const parsed = parsePrefixArgs(["MONTANT:100"]);
    expect(parsed.options).toEqual({ montant: "100" });
  });
});

describe("getters typés", () => {
  it("getRequiredStringOption lève si absent", () => {
    expect(() => getRequiredStringOption({ subcommand: null, options: {} }, "raison")).toThrow(ValidationError);
  });

  it("getIntOption valide les bornes min/max", () => {
    const args = { subcommand: null, options: { montant: "5" } };
    expect(getIntOption(args, "montant", { min: 1, max: 10 })).toBe(5);
    expect(() => getIntOption(args, "montant", { min: 10 })).toThrow(ValidationError);
  });

  it("getIntOption rejette un non-entier", () => {
    expect(() => getIntOption({ subcommand: null, options: { montant: "abc" } }, "montant")).toThrow(ValidationError);
    expect(() => getIntOption({ subcommand: null, options: { montant: "1.5" } }, "montant")).toThrow(ValidationError);
  });

  it("getRequiredIntOption lève si absent", () => {
    expect(() => getRequiredIntOption({ subcommand: null, options: {} }, "montant")).toThrow(ValidationError);
  });

  it("getBooleanOption accepte plusieurs formulations", () => {
    expect(getBooleanOption({ subcommand: null, options: { statut: "true" } }, "statut")).toBe(true);
    expect(getBooleanOption({ subcommand: null, options: { statut: "oui" } }, "statut")).toBe(true);
    expect(getBooleanOption({ subcommand: null, options: { statut: "false" } }, "statut")).toBe(false);
    expect(getBooleanOption({ subcommand: null, options: { statut: "non" } }, "statut")).toBe(false);
    expect(getBooleanOption({ subcommand: null, options: {} }, "statut")).toBeNull();
  });

  it("getBooleanOption rejette une valeur inconnue", () => {
    expect(() => getBooleanOption({ subcommand: null, options: { statut: "peut-être" } }, "statut")).toThrow(ValidationError);
  });

  it("getChoiceOption valide l'appartenance à la liste autorisée", () => {
    const args = { subcommand: null, options: { periode: "week" } };
    expect(getChoiceOption(args, "periode", ["today", "week", "month"] as const)).toBe("week");
    expect(() => getChoiceOption({ subcommand: null, options: { periode: "yesterday" } }, "periode", ["today", "week"] as const)).toThrow(
      ValidationError,
    );
  });
});

describe("extractUserId / extractChannelId", () => {
  it("extrait l'id d'une mention utilisateur standard et nickname", () => {
    expect(extractUserId("<@123456789012345678>")).toBe("123456789012345678");
    expect(extractUserId("<@!123456789012345678>")).toBe("123456789012345678");
  });

  it("accepte un id brut valide", () => {
    expect(extractUserId("123456789012345678")).toBe("123456789012345678");
  });

  it("rejette une valeur qui n'est ni une mention ni un id plausible", () => {
    expect(extractUserId("pas-un-id")).toBeNull();
    expect(extractUserId("123")).toBeNull(); // trop court pour être un snowflake
  });

  it("extrait l'id d'une mention de salon", () => {
    expect(extractChannelId("<#123456789012345678>")).toBe("123456789012345678");
  });
});
