import { env } from "../config/env.js";
import {
  completeReservation as completeReservationRepo,
  countAiRequestsSince,
  countTransactions,
  earnCredits,
  getMostUsedFeature,
  getOrCreateCreditAccount,
  getStatsSince,
  listTransactions,
  refundReservation as refundReservationRepo,
  spendCredits,
} from "../database/repositories/creditRepository.js";
import { getAiBudgetOverrides } from "../database/repositories/guildRepository.js";
import { getCreditCost, getFeatureLabel } from "./creditCosts.js";
import { logAdminAction } from "./auditService.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("creditService");

/**
 * Interrupteur maître : quand `false`, TOUT le Credit Engine se comporte en
 * no-op qui accepte toujours — aucune commande IA ne doit jamais bloquer ou
 * planter à cause des crédits. C'est la seule vérification de ce flag dans
 * tout le module ; le reste du code n'a pas à s'en soucier.
 */
export function creditsEnabled(): boolean {
  return env.CREDITS_ENABLED;
}

export interface Wallet {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalRefunded: number;
}

export async function getWallet(userId: string): Promise<Wallet> {
  if (!creditsEnabled()) return { balance: 0, totalEarned: 0, totalSpent: 0, totalRefunded: 0 };

  const account = await getOrCreateCreditAccount(userId);
  return {
    balance: account.balance,
    totalEarned: account.totalEarned,
    totalSpent: account.totalSpent,
    totalRefunded: account.totalRefunded,
  };
}

export type ReserveResult =
  | { ok: true; transactionId: string | null; cost: number }
  | { ok: false; required: number; current: number };

/** Plafonds effectifs pour un utilisateur/serveur donné — override par serveur (`/ai budget`) sinon défaut global (.env). */
async function resolveBudgetLimits(guildId: string | undefined): Promise<{ maxDailySpend: number; maxMonthlySpend: number }> {
  const budgetOverrides = guildId ? await getAiBudgetOverrides(guildId) : null;
  return {
    maxDailySpend: budgetOverrides?.maxDailyAiSpend ?? env.MAX_DAILY_AI_SPEND,
    maxMonthlySpend: budgetOverrides?.maxMonthlyAiSpend ?? env.MAX_MONTHLY_AI_SPEND,
  };
}

export interface SpendBudgetStatus {
  dailyLimit: number; // 0 = pas de limite
  dailySpent: number;
  monthlyLimit: number;
  monthlySpent: number;
}

/** Visibilité utilisateur sur sa consommation vs. ses plafonds anti-abus (`/balance`). */
export async function getSpendBudgetStatus(userId: string, guildId?: string): Promise<SpendBudgetStatus> {
  const { maxDailySpend, maxMonthlySpend } = await resolveBudgetLimits(guildId);
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [dailyStats, monthlyStats] = await Promise.all([
    getStatsSince(userId, startOfDay),
    getStatsSince(userId, startOfMonth),
  ]);

  return {
    dailyLimit: maxDailySpend,
    dailySpent: dailyStats.spent,
    monthlyLimit: maxMonthlySpend,
    monthlySpent: monthlyStats.spent,
  };
}

/**
 * Réserve le coût d'une feature IA avant l'appel au provider. À `false`,
 * retourne toujours `{ ok: true, transactionId: null }` — rien n'est
 * vérifié ni consommé, l'IA continue de fonctionner normalement.
 *
 * `providerName` : coût potentiellement majoré si le provider actif pour
 * cette feature est plus cher (voir AI_PROVIDER_COST_MULTIPLIERS et
 * getCreditCost). `guildId` : si ce serveur a un budget IA personnalisé
 * (`/ai budget`), il remplace le plafond global .env pour ce seul serveur.
 */
export async function reserveForFeature(
  userId: string,
  guildId: string | undefined,
  feature: string,
  providerName?: string,
): Promise<ReserveResult> {
  const cost = getCreditCost(feature, providerName);
  if (!creditsEnabled() || cost <= 0) return { ok: true, transactionId: null, cost };

  // Anti-abus : plafonds de dépense quotidien/mensuel (0 = désactivé). Un
  // serveur peut surcharger les valeurs globales (.env) via /ai budget.
  const { maxDailySpend, maxMonthlySpend } = await resolveBudgetLimits(guildId);

  const now = new Date();
  if (maxDailySpend > 0) {
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const dailyStats = await getStatsSince(userId, startOfDay);
    if (dailyStats.spent + cost > maxDailySpend) {
      throw new AppError(
        `Tu as atteint ta limite de dépense IA quotidienne (${maxDailySpend} crédits). Réessaie demain.`,
      );
    }
  }
  if (maxMonthlySpend > 0) {
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const monthlyStats = await getStatsSince(userId, startOfMonth);
    if (monthlyStats.spent + cost > maxMonthlySpend) {
      throw new AppError(
        `Tu as atteint ta limite de dépense IA mensuelle (${maxMonthlySpend} crédits).`,
      );
    }
  }

  const result = await spendCredits({
    userId,
    ...(guildId !== undefined ? { guildId } : {}),
    amount: cost,
    type: "SPEND",
    status: "RESERVED",
    reason: `Réservation — ${getFeatureLabel(feature)}`,
    feature,
  });

  if (!result) {
    const account = await getOrCreateCreditAccount(userId);
    return { ok: false, required: cost, current: account.balance };
  }

  return { ok: true, transactionId: result.transaction.id, cost };
}

/** Confirme une réservation après succès de l'appel IA. No-op si les crédits sont désactivés. */
export async function confirmReservation(transactionId: string | null): Promise<void> {
  if (!transactionId) return;
  await completeReservationRepo(transactionId);
}

/** Rembourse une réservation après échec de l'appel IA. No-op si les crédits sont désactivés. Idempotent. */
export async function refundReservation(transactionId: string | null): Promise<void> {
  if (!transactionId) return;
  const refunded = await refundReservationRepo(transactionId);
  if (refunded) log.info({ transactionId }, "Réservation remboursée après échec IA");
}

/** Récompense générique (Reward Engine) — voir rewardService.ts pour les déclencheurs concrets. */
export async function earnReward(
  userId: string,
  amount: number,
  type: string,
  reason: string,
  guildId?: string,
): Promise<void> {
  if (!creditsEnabled() || amount <= 0) return;
  await earnCredits({ userId, amount, type, reason, ...(guildId !== undefined ? { guildId } : {}) });
}

export async function adminGrant(
  adminId: string,
  targetUserId: string,
  amount: number,
  reason: string,
): Promise<void> {
  if (amount <= 0) throw new AppError("Le montant doit être positif.");
  await earnCredits({ userId: targetUserId, amount, type: "ADMIN_GRANT", reason });
  await logAdminAction(adminId, "CREDITS_GRANTED", { targetUserId, reason, metadata: { amount } });
}

export async function adminRemove(
  adminId: string,
  targetUserId: string,
  amount: number,
  reason: string,
): Promise<boolean> {
  if (amount <= 0) throw new AppError("Le montant doit être positif.");
  const result = await spendCredits({
    userId: targetUserId,
    amount,
    type: "ADMIN_REMOVE",
    reason,
  });
  await logAdminAction(adminId, "CREDITS_REMOVED", {
    targetUserId,
    reason,
    metadata: { amount, succeeded: result !== null },
  });
  return result !== null;
}

export async function adminSet(
  adminId: string,
  targetUserId: string,
  amount: number,
  reason: string,
): Promise<void> {
  if (amount < 0) throw new AppError("Le montant ne peut pas être négatif.");
  const account = await getOrCreateCreditAccount(targetUserId);
  const delta = amount - account.balance;

  if (delta > 0) {
    await earnCredits({ userId: targetUserId, amount: delta, type: "SYSTEM_ADJUSTMENT", reason });
  } else if (delta < 0) {
    await spendCredits({
      userId: targetUserId,
      amount: -delta,
      type: "SYSTEM_ADJUSTMENT",
      reason,
    });
  }

  await logAdminAction(adminId, "CREDITS_SET", {
    targetUserId,
    reason,
    metadata: { newBalance: amount },
  });
}

export async function getTransactionHistory(userId: string, limit: number, offset = 0, type?: string) {
  const [transactions, total] = await Promise.all([
    listTransactions(userId, limit, offset, type),
    countTransactions(userId, type),
  ]);
  return { transactions, total };
}

export interface CreditStats extends Wallet {
  thisMonth: { earned: number; spent: number };
  aiRequestCount: number;
  mostUsedFeature: string | null;
}

export async function getCreditStats(userId: string): Promise<CreditStats> {
  const wallet = await getWallet(userId);
  if (!creditsEnabled()) {
    return { ...wallet, thisMonth: { earned: 0, spent: 0 }, aiRequestCount: 0, mostUsedFeature: null };
  }

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthStats = await getStatsSince(userId, startOfMonth);

  const [aiRequestCount, mostUsedFeature] = await Promise.all([
    countAiRequestsSince(userId, new Date(0)),
    getMostUsedFeature(userId),
  ]);

  return {
    ...wallet,
    thisMonth: { earned: monthStats.earned, spent: monthStats.spent },
    aiRequestCount,
    mostUsedFeature,
  };
}
