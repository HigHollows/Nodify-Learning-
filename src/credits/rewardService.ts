import { env } from "../config/env.js";
import { getLatestClaim, tryClaimReward } from "../database/repositories/rewardRepository.js";
import { isSupporter as isSupporterRepo } from "../database/repositories/userRepository.js";
import { earnReward, getWallet } from "./creditService.js";
import type { RewardType } from "./creditTypes.js";
import { formatDuration } from "../ui/container.js";
import { AppError } from "../utils/errors.js";

/**
 * Reward Engine générique : DAILY/WEEKLY/MONTHLY partagent la même logique
 * (cooldown vérifié côté serveur + crédit). Les récompenses d'apprentissage
 * (cours, quiz, CTF, streak, achievements) passent par `awardLearningReward`
 * plus bas — pas de cooldown, déclenchées par un vrai événement une fois.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

interface RewardConfig {
  enabled: boolean;
  amount: number;
  cooldownMs: number;
}

function getRewardConfig(type: RewardType): RewardConfig {
  switch (type) {
    case "DAILY":
      return { enabled: env.DAILY_REWARD_ENABLED, amount: env.DAILY_REWARD_AMOUNT, cooldownMs: DAY_MS };
    case "WEEKLY":
      return {
        enabled: env.WEEKLY_REWARD_ENABLED,
        amount: env.WEEKLY_REWARD_AMOUNT,
        cooldownMs: 7 * DAY_MS,
      };
    case "MONTHLY":
      return {
        enabled: env.MONTHLY_REWARD_ENABLED,
        amount: env.MONTHLY_REWARD_AMOUNT,
        cooldownMs: 30 * DAY_MS,
      };
  }
}

export interface RewardStatus {
  available: boolean;
  amount: number;
  enabled: boolean;
  nextAvailableAt: Date | null;
  remainingLabel: string;
}

export async function getRewardStatus(userId: string, type: RewardType): Promise<RewardStatus> {
  const config = getRewardConfig(type);
  if (!config.enabled) {
    return { available: false, amount: config.amount, enabled: false, nextAvailableAt: null, remainingLabel: "désactivé" };
  }

  const latest = await getLatestClaim(userId, type);
  const now = Date.now();

  if (!latest || latest.nextAvailableAt.getTime() <= now) {
    return { available: true, amount: config.amount, enabled: true, nextAvailableAt: null, remainingLabel: "disponible" };
  }

  return {
    available: false,
    amount: config.amount,
    enabled: true,
    nextAvailableAt: latest.nextAvailableAt,
    remainingLabel: formatDuration(latest.nextAvailableAt.getTime() - now),
  };
}

export type ClaimRewardResult =
  | { claimed: true; amount: number; newBalance: number }
  | { claimed: false; remainingLabel: string };

export async function claimReward(
  userId: string,
  guildId: string | undefined,
  type: RewardType,
): Promise<ClaimRewardResult> {
  const config = getRewardConfig(type);
  if (!config.enabled) {
    throw new AppError(`La récompense ${type.toLowerCase()} est désactivée sur Nodify pour l'instant.`);
  }

  const attempt = await tryClaimReward(userId, type, config.amount, config.cooldownMs);

  if (!attempt.claimed) {
    return {
      claimed: false,
      remainingLabel: formatDuration(attempt.nextAvailableAt.getTime() - Date.now()),
    };
  }

  await earnReward(userId, config.amount, type, `Récompense ${type.toLowerCase()}`, guildId);

  // Bonus supporter (statut attribué par un admin, pas acheté) : uniquement
  // sur la récompense MONTHLY, en transaction BONUS séparée pour rester
  // distinguable dans l'historique/les stats de la récompense MONTHLY de base.
  let bonusAmount = 0;
  if (type === "MONTHLY" && env.SUPPORTER_MONTHLY_BONUS_AMOUNT > 0 && (await isSupporterRepo(userId))) {
    bonusAmount = env.SUPPORTER_MONTHLY_BONUS_AMOUNT;
    await earnReward(userId, bonusAmount, "BONUS", "Bonus supporter (récompense mensuelle)", guildId);
  }

  const wallet = await getWallet(userId);

  return { claimed: true, amount: config.amount + bonusAmount, newBalance: wallet.balance };
}

/**
 * Bonus événementiel ponctuel accordé par un admin (ex: annonce, event
 * communautaire) — même mécanisme que les Learning Rewards (pas de
 * cooldown, déclenché une fois), mais initié manuellement plutôt que par
 * une activité. Voir /credit-admin bonus.
 */
export async function awardEventBonus(
  userId: string,
  amount: number,
  reason: string,
  guildId?: string,
): Promise<void> {
  await earnReward(userId, amount, "BONUS", reason, guildId);
}

// --- Learning Rewards (déclenchées par de vraies activités, pas de cooldown) ---

function learningRewardsEnabled(): boolean {
  return env.LEARNING_REWARDS_ENABLED;
}

/** Cours Nodify Academy entièrement terminé. */
export async function awardCourseCompleted(userId: string): Promise<void> {
  if (!learningRewardsEnabled()) return;
  await earnReward(userId, 10, "LEARNING_REWARD", "Cours terminé");
}

/** Une leçon (quiz) validée avec succès. */
export async function awardLessonPassed(userId: string): Promise<void> {
  if (!learningRewardsEnabled()) return;
  await earnReward(userId, 5, "LEARNING_REWARD", "Quiz réussi");
}

/** Défi CTF résolu. */
export async function awardChallengeCompleted(userId: string): Promise<void> {
  if (!learningRewardsEnabled()) return;
  await earnReward(userId, 10, "LEARNING_REWARD", "Challenge terminé");
}

/** Palier de streak d'engagement atteint (tous les 7 jours). */
export async function awardStreakMilestone(userId: string, streakDays: number): Promise<void> {
  if (!learningRewardsEnabled()) return;
  await earnReward(userId, 25, "LEARNING_REWARD", `Streak de ${streakDays} jours`);
}

/** Achievement débloqué. */
export async function awardAchievementUnlocked(userId: string): Promise<void> {
  if (!learningRewardsEnabled()) return;
  await earnReward(userId, 20, "ACHIEVEMENT", "Achievement débloqué");
}
