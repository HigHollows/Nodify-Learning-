import type { AIProvider, ExplainRequest } from "../types.js";

/**
 * Provider par défaut, actif tant qu'aucune clé API IA n'est configurée.
 * Ne fait AUCUN appel réseau et ne prétend jamais être une vraie réponse
 * générée par IA — le message le dit explicitement, pour ne pas induire
 * l'utilisateur en erreur.
 */
export class StubProvider implements AIProvider {
  readonly name = "stub";

  async explainConcept(request: ExplainRequest): Promise<string> {
    const lines = [
      "*(Mode démonstration — aucune clé API IA n'est configurée sur ce bot)*",
      "",
      `Une fois \`ANTHROPIC_API_KEY\` renseignée dans le \`.env\`, Nodify expliquera ` +
        `« ${request.term} » avec une vraie IA, adaptée à ton niveau (${request.levelHint}).`,
    ];

    if (request.context) {
      lines.push("", "Ce que le dictionnaire Nodify en dit déjà :", `> ${request.context}`);
    }

    return lines.join("\n");
  }
}
