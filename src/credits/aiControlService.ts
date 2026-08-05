import {
  getOrCreateSystemConfig,
  recordFailedRequest,
  recordSuccessfulRequest,
  setAiMode as setAiModeRepo,
  setLastNotifiedStatus,
  setStatusPanelLocation,
} from "../database/repositories/systemConfigRepository.js";
import { getCreditCost } from "./creditCosts.js";
import type { AIMode, AIStatus } from "./creditTypes.js";
import { AIUnavailableError } from "../utils/errors.js";
import { logAdminAction } from "./auditService.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("aiControlService");

/** Centralise le calcul des bornes "aujourd'hui/cette semaine/ce mois-ci" — utilisé par `/ai stats` et `/ai usage`. */
export function periodSince(period: "today" | "week" | "month"): Date {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Au-delà d'une erreur récente de ce coût minimum, l'erreur est bloquante en mode LIMITED. */
const LIMITED_MODE_MAX_COST = 2;
/** Une erreur plus récente que ceci (et plus récente que le dernier succès) fait passer le statut en ERROR/QUOTA. */
const ERROR_WINDOW_MS = 10 * 60 * 1000;
/** Au-delà, une erreur passée n'affecte plus le statut affiché (juste un DEGRADED sur une fenêtre plus large). */
const DEGRADED_WINDOW_MS = 30 * 60 * 1000;

export interface SystemConfigView {
  aiMode: AIMode;
  maintenanceReason: string | null;
  maintenanceSince: Date | null;
  lastSuccessfulRequestAt: Date | null;
  lastErrorAt: Date | null;
  lastErrorMessage: string | null;
  lastErrorCode: string | null;
}

export async function getSystemConfig(): Promise<SystemConfigView> {
  const config = await getOrCreateSystemConfig();
  return {
    aiMode: config.aiMode as AIMode,
    maintenanceReason: config.maintenanceReason,
    maintenanceSince: config.maintenanceSince,
    lastSuccessfulRequestAt: config.lastSuccessfulRequestAt,
    lastErrorAt: config.lastErrorAt,
    lastErrorMessage: config.lastErrorMessage,
    lastErrorCode: config.lastErrorCode,
  };
}

export async function setAiMode(
  mode: AIMode,
  adminId: string,
  reason?: string,
): Promise<void> {
  const since = mode === "MAINTENANCE" ? new Date() : null;
  await setAiModeRepo(mode, { reason: reason ?? null, since });
  await logAdminAction(adminId, `AI_MODE_${mode}`, reason !== undefined ? { reason } : {});
  log.info({ mode, adminId, reason }, "Mode IA changé");
}

/** Entrée minimale pour dériver le statut — pure, testable sans base de données (voir aiControlService.test.ts). */
export interface AiStatusInput {
  aiMode: AIMode;
  lastErrorAt: Date | null;
  lastSuccessfulRequestAt: Date | null;
  lastErrorCode: string | null;
}

/**
 * Fonction pure : dérive le statut PUBLIC affiché à partir de l'intention
 * admin + télémétrie réelle — jamais stocké tel quel. Séparée de
 * `computeAiStatus` (qui va chercher la config en base) pour rester
 * unit-testable sans DB.
 */
export function deriveAiStatus(config: AiStatusInput, now: number): AIStatus {
  if (config.aiMode === "CLOSED") return "OFFLINE";
  if (config.aiMode === "MAINTENANCE") return "MAINTENANCE";
  if (config.aiMode === "LIMITED") return "LIMITED";

  // Mode OPEN : le statut réel dépend de la télémétrie des derniers appels.
  // Un succès survenu APRÈS la dernière erreur invalide entièrement cette
  // erreur pour l'affichage — jamais de DEGRADED/ERROR/QUOTA fantôme suite
  // à un appel qui a depuis réussi.
  const lastError = config.lastErrorAt?.getTime();
  const lastSuccess = config.lastSuccessfulRequestAt?.getTime();
  const errorIsCurrent = lastError !== undefined && (lastSuccess === undefined || lastError > lastSuccess);

  if (errorIsCurrent && lastError !== undefined) {
    if (now - lastError < ERROR_WINDOW_MS) {
      return config.lastErrorCode === "QUOTA" ? "QUOTA" : "ERROR";
    }
    if (now - lastError < DEGRADED_WINDOW_MS) {
      return "DEGRADED";
    }
  }

  return "OPERATIONAL";
}

/** Calcule le statut PUBLIC affiché à partir de la config réelle en base. */
export async function computeAiStatus(): Promise<AIStatus> {
  const config = await getSystemConfig();
  return deriveAiStatus(config, Date.now());
}

/**
 * Vérifie que l'IA est utilisable pour une feature donnée, sinon lève
 * `AIUnavailableError` — à appeler en tout premier dans aiService.complete(),
 * avant toute réservation de crédits ou appel réseau réel.
 */
export async function assertAiAvailable(feature: string): Promise<void> {
  const config = await getSystemConfig();

  if (config.aiMode === "CLOSED") {
    throw new AIUnavailableError(config.aiMode, "les services IA sont temporairement désactivés");
  }

  if (config.aiMode === "MAINTENANCE") {
    throw new AIUnavailableError(
      config.aiMode,
      config.maintenanceReason ?? "maintenance en cours",
    );
  }

  if (config.aiMode === "LIMITED" && getCreditCost(feature) > LIMITED_MODE_MAX_COST) {
    throw new AIUnavailableError(
      config.aiMode,
      "cette fonctionnalité est temporairement suspendue en mode limité (trop coûteuse)",
    );
  }
}

export async function recordAiSuccess(): Promise<void> {
  await recordSuccessfulRequest();
}

export async function recordAiFailure(errorMessage: string, errorCode?: string): Promise<void> {
  await recordFailedRequest(errorMessage, errorCode);
}

/** Dernier statut pour lequel une alerte "AI Incident" a déjà été envoyée (anti-spam de notifications). */
export async function getLastNotifiedStatus(): Promise<AIStatus | null> {
  const config = await getOrCreateSystemConfig();
  return (config.lastNotifiedStatus as AIStatus | null) ?? null;
}

export async function markStatusNotified(status: AIStatus): Promise<void> {
  await setLastNotifiedStatus(status);
}

export async function saveStatusPanelLocation(channelId: string, messageId: string): Promise<void> {
  await setStatusPanelLocation(channelId, messageId);
}

export async function getStatusPanelLocation(): Promise<{
  channelId: string | null;
  messageId: string | null;
}> {
  const config = await getOrCreateSystemConfig();
  return { channelId: config.statusChannelId, messageId: config.statusMessageId };
}
