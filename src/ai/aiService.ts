import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";
import { AnthropicProvider } from "./providers/anthropicProvider.js";
import { StubProvider } from "./providers/stubProvider.js";
import type { AIProvider, ExplainRequest } from "./types.js";

const log = childLogger("aiService");

/**
 * ModelRouter minimal : un seul provider actif à la fois, choisi une fois
 * au démarrage selon la config disponible. Centralise le choix ici plutôt
 * que de laisser chaque commande décider elle-même quel provider appeler.
 */
const activeProvider: AIProvider = env.ANTHROPIC_API_KEY
  ? new AnthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL)
  : new StubProvider();

log.info(`AIService initialisé — provider actif : ${activeProvider.name}`);

export function getActiveProviderName(): string {
  return activeProvider.name;
}

export async function explainConcept(request: ExplainRequest): Promise<string> {
  try {
    return await activeProvider.explainConcept(request);
  } catch (error) {
    log.error({ err: error, provider: activeProvider.name }, "Échec de l'appel au provider IA");
    throw new AppError("Le service IA est momentanément indisponible, réessaie plus tard.");
  }
}
