export type LevelHint = "beginner" | "advanced";

export interface ExplainRequest {
  term: string;
  levelHint: LevelHint;
  /** Définition déjà connue du Knowledge Engine, si le terme existe dans le dictionnaire. */
  context?: string;
}

/**
 * Contrat que tout provider IA doit respecter. Un seul point d'entrée pour
 * l'instant (explainConcept) — on étendra (RAG, mémoire...) sans changer
 * les providers existants, juste en ajoutant des méthodes au contrat.
 */
export interface AIProvider {
  readonly name: string;
  explainConcept(request: ExplainRequest): Promise<string>;
}
