import type { AIProvider, CompletionRequest } from "../types.js";

/**
 * Provider par défaut, actif tant qu'aucune clé API IA n'est configurée.
 * Ne fait AUCUN appel réseau et ne prétend jamais être une vraie réponse
 * générée par IA — le message le dit explicitement, pour ne pas induire
 * l'utilisateur en erreur.
 */
export class StubProvider implements AIProvider {
  readonly name = "stub";

  async complete(request: CompletionRequest): Promise<string> {
    const preview = request.user.length > 200 ? `${request.user.slice(0, 200)}...` : request.user;

    return [
      "*(Mode démonstration — aucune clé API IA n'est configurée sur ce bot)*",
      "",
      "Une fois `ANTHROPIC_API_KEY` renseignée dans le `.env`, Nodify répondrait ici à :",
      `> ${preview}`,
    ].join("\n");
  }
}
