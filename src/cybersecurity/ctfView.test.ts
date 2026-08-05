import { describe, expect, it } from "vitest";
import { parseCtfSubmitButtonId } from "./ctfView.js";

describe("parseCtfSubmitButtonId", () => {
  it("extrait la clé du défi d'un customId valide", () => {
    expect(parseCtfSubmitButtonId("ctf:submit:caesar-basics")).toBe("caesar-basics");
  });

  it("retourne null pour un préfixe différent", () => {
    expect(parseCtfSubmitButtonId("academy:start:js-intro")).toBeNull();
  });

  it("ne confond pas avec le customId du modal (ctf:submit_modal:...)", () => {
    expect(parseCtfSubmitButtonId("ctf:submit_modal:caesar-basics")).toBeNull();
  });
});
