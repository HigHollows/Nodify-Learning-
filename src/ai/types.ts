export type LevelHint = "beginner" | "advanced";

export interface CompletionRequest {
  /** Instructions de comportement/rôle — jamais montré à l'utilisateur. */
  system: string;
  /** La requête concrète (le texte à traiter). */
  user: string;
  maxTokens?: number;
}

/**
 * Contrat unique que tout provider IA doit respecter : une seule méthode
 * générique (`complete`). Chaque feature (ExplainMe, Security Review, Debug
 * Coach, Docs RAG...) construit son propre prompt système/utilisateur dans
 * aiService.ts et appelle `complete()` — le provider n'a jamais besoin de
 * connaître les features qui l'utilisent, et ajouter une feature n'oblige
 * pas à toucher StubProvider/AnthropicProvider.
 */
export interface AIProvider {
  readonly name: string;
  complete(request: CompletionRequest): Promise<string>;
}
