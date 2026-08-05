import {
  countAiCalls,
  getTopFeaturesSince,
  getUsageStatsSince,
  listAiCalls,
  type AiUsageFilter,
} from "../database/repositories/aiCallRepository.js";
import { getActiveProviderName } from "../ai/aiService.js";
import { computeAiStatus, periodSince } from "./aiControlService.js";
import { creditsEnabled } from "./creditService.js";
import type { AdminControlCenterData, AiUsageData, AiUsageFilters } from "./aiStatusView.js";

/**
 * Requêtes composites pour l'AI Control Center — dans un fichier séparé
 * (pas dans aiControlService.ts) pour éviter un cycle d'imports : ce fichier
 * dépend à la fois de aiControlService.ts (computeAiStatus) ET de
 * aiService.ts (getActiveProviderName), qui dépend lui-même de
 * aiControlService.ts. Partagé par la commande `/ai` et les boutons
 * (`ai:admin:refresh`, `ai:usage:*`) pour ne jamais dupliquer la logique de
 * fetch entre les deux.
 */
export async function getAdminControlCenterData(): Promise<AdminControlCenterData> {
  const [status, today, week, month] = await Promise.all([
    computeAiStatus(),
    getUsageStatsSince(periodSince("today")),
    getUsageStatsSince(periodSince("week")),
    getUsageStatsSince(periodSince("month")),
  ]);

  return { status, provider: getActiveProviderName(), creditsEnabled: creditsEnabled(), today, week, month };
}

const AI_USAGE_PAGE_SIZE = 8;

export async function getAiUsagePage(page: number, filters: AiUsageFilters): Promise<AiUsageData> {
  const filter: AiUsageFilter = {
    ...(filters.period ? { since: periodSince(filters.period as "today" | "week" | "month") } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.feature ? { feature: filters.feature } : {}),
  };

  const [calls, total, topFeatures] = await Promise.all([
    listAiCalls(filter, AI_USAGE_PAGE_SIZE, page * AI_USAGE_PAGE_SIZE),
    countAiCalls(filter),
    getTopFeaturesSince(periodSince("week"), 5),
  ]);

  return { calls, total, page, filters, topFeatures };
}
