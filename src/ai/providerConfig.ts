import { env } from "../config/env.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("providerConfig");

/**
 * Parse une variable d'env JSON optionnelle en objet clé→valeur, en avalant
 * toute erreur de parsing (config invalide ne doit jamais planter le bot au
 * démarrage — juste retomber sur "pas d'override").
 */
function parseJsonRecord(raw: string | undefined, varName: string): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // ignoré volontairement, voir le log ci-dessous
  }
  log.warn({ varName, raw }, "Variable d'environnement JSON invalide — ignorée");
  return {};
}

/** `{"feature": "provider"}` — force un provider précis pour une feature donnée. */
export function getFeatureProviderOverrides(): Record<string, string> {
  const parsed = parseJsonRecord(env.AI_FEATURE_PROVIDER_OVERRIDES, "AI_FEATURE_PROVIDER_OVERRIDES");
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string") result[key] = value;
  }
  return result;
}

/** `{"provider": multiplicateur}` — défaut 1 pour un provider non listé. */
export function getProviderCostMultiplier(providerName: string): number {
  const parsed = parseJsonRecord(env.AI_PROVIDER_COST_MULTIPLIERS, "AI_PROVIDER_COST_MULTIPLIERS");
  const value = parsed[providerName];
  return typeof value === "number" && value > 0 ? value : 1;
}
