export type LevelHint = "beginner" | "advanced";

export interface CompletionRequest {
  /** Instructions de comportement/rôle — jamais montré à l'utilisateur. */
  system: string;
  /** La requête concrète (le texte à traiter). */
  user: string;
  maxTokens?: number;
}

/**
 * Codes d'erreur structurés — permettent à l'AI Control Center de calculer
 * un statut fiable (QUOTA/DEGRADED/ERROR...) sans deviner en cherchant des
 * mots-clés dans un message d'erreur brut du SDK.
 */
export const AI_ERROR_CODES = ["QUOTA", "TIMEOUT", "NETWORK", "INVALID_KEY", "PROVIDER_ERROR"] as const;
export type AiErrorCode = (typeof AI_ERROR_CODES)[number];

export class AiProviderError extends Error {
  constructor(
    public readonly code: AiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

export interface CompletionUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface CompletionResult {
  text: string;
  /** Absent pour les providers qui ne l'exposent pas (Stub, Groq pour l'instant). */
  usage?: CompletionUsage;
  /** Modèle réellement utilisé pour cette réponse (peut différer du modèle par défaut à terme). */
  model?: string;
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
  complete(request: CompletionRequest): Promise<CompletionResult>;
}
