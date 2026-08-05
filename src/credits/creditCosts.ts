import { getProviderCostMultiplier } from "../ai/providerConfig.js";

/**
 * Coûts en crédits par fonctionnalité IA — LE seul endroit où ces valeurs
 * sont définies. Interdiction de coder `if (command === "explainme") cost = 1`
 * dans une commande : toute commande IA appelle `getCreditCost(feature)`.
 *
 * Volontairement une constante TypeScript (pas une table DB) : ces valeurs
 * ne sont pas censées changer sans une vraie décision produit, contrairement
 * aux montants de récompense (qui eux vivent en .env, modifiables sans
 * toucher au code). Si un jour il faut les rendre éditables depuis Discord,
 * seul ce fichier + son point de lecture changent.
 */
export const AI_FEATURE_COSTS: Record<string, number> = {
  explainme: 1,
  docs: 1,
  codereview: 2,
  plan: 2,
  debugme: 2,
  securityreview: 3,
  threatmodel: 3,
};

export const AI_FEATURE_LABELS: Record<string, string> = {
  explainme: "ExplainMe",
  docs: "Documentation (RAG)",
  codereview: "Code Review",
  plan: "Learning Planner",
  debugme: "Debug Coach",
  securityreview: "Security Review",
  threatmodel: "Threat Model",
};

export function getCreditCost(feature: string, providerName?: string): number {
  const baseCost = AI_FEATURE_COSTS[feature] ?? 1; // coût par défaut si une feature n'est pas listée (fail-safe, pas gratuit par erreur)
  if (!providerName) return baseCost;

  // Un provider plus cher (ex: un modèle premium) peut coûter plus de crédits
  // — voir AI_PROVIDER_COST_MULTIPLIERS (src/ai/providerConfig.ts).
  return Math.max(1, Math.ceil(baseCost * getProviderCostMultiplier(providerName)));
}

export function getFeatureLabel(feature: string): string {
  return AI_FEATURE_LABELS[feature] ?? feature;
}

export function listAiCosts(): { feature: string; label: string; cost: number }[] {
  return Object.keys(AI_FEATURE_COSTS).map((feature) => ({
    feature,
    label: getFeatureLabel(feature),
    cost: getCreditCost(feature),
  }));
}
