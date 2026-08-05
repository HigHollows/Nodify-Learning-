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

// Ces variables viennent de `.env` (lu une seule fois au démarrage, voir
// src/config/env.ts) — jamais modifiées en cours de process. Pas la peine de
// re-parser le même JSON à chaque appel IA : on le calcule paresseusement
// une fois, au premier appel, puis on garde le résultat.
let featureProviderOverridesCache: Record<string, string> | null = null;
let providerCostMultipliersCache: Record<string, unknown> | null = null;

/** `{"feature": "provider"}` — force un provider précis pour une feature donnée. */
export function getFeatureProviderOverrides(): Record<string, string> {
  if (featureProviderOverridesCache === null) {
    const parsed = parseJsonRecord(env.AI_FEATURE_PROVIDER_OVERRIDES, "AI_FEATURE_PROVIDER_OVERRIDES");
    featureProviderOverridesCache = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") featureProviderOverridesCache[key] = value;
    }
  }
  return featureProviderOverridesCache;
}

/** `{"provider": multiplicateur}` — défaut 1 pour un provider non listé. */
export function getProviderCostMultiplier(providerName: string): number {
  providerCostMultipliersCache ??= parseJsonRecord(env.AI_PROVIDER_COST_MULTIPLIERS, "AI_PROVIDER_COST_MULTIPLIERS");
  const value = providerCostMultipliersCache[providerName];
  return typeof value === "number" && value > 0 ? value : 1;
}

/**
 * Réservé aux tests : la vraie config `.env` ne change jamais en cours de
 * process, mais les tests simulent plusieurs "environnements" successifs
 * dans le même fichier — sans ce reset, le cache figerait la première valeur
 * lue pour toute la suite.
 */
export function __resetProviderConfigCacheForTests(): void {
  featureProviderOverridesCache = null;
  providerCostMultipliersCache = null;
}
