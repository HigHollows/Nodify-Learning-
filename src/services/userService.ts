import { awardStreakMilestone } from "../credits/rewardService.js";
import {
  getOrCreateUser,
  getUserProfile,
  updateStreak,
} from "../database/repositories/userRepository.js";
import { todayUtc, yesterdayUtc } from "../utils/date.js";
import { childLogger } from "../utils/logger.js";
import { unlockAchievement } from "./achievementService.js";

const log = childLogger("userService");

export interface DiscordUserLike {
  id: string;
  username: string;
}

/**
 * À appeler à chaque interaction Nodify (voir interactionCreate.ts).
 * - Crée le profil au premier contact et débloque "Bienvenue".
 * - Met à jour le streak au plus une fois par jour UTC (idempotent si
 *   appelée plusieurs fois le même jour).
 *
 * Ne fait volontairement gagner AUCUN XP ici : l'XP doit rester réservée
 * à de vraies activités d'apprentissage (Academy, Phase 5) pour ne pas
 * dévaluer le système de progression avant même qu'il ait un contenu réel.
 */
export async function recordActivity(discordUser: DiscordUserLike): Promise<void> {
  const { user, isNew } = await getOrCreateUser(discordUser.id, discordUser.username);

  if (isNew) {
    await unlockAchievement(user.id, "welcome");
  }

  const today = todayUtc();
  if (user.lastActiveDate === today) return; // déjà comptabilisé aujourd'hui

  const wasActiveYesterday = user.lastActiveDate === yesterdayUtc();
  const currentStreak = wasActiveYesterday ? user.currentStreak + 1 : 1;
  const longestStreak = Math.max(user.longestStreak, currentStreak);

  await updateStreak(user.id, { currentStreak, longestStreak, lastActiveDate: today });
  log.debug({ userId: user.id, currentStreak }, "Streak mis à jour");

  // Learning Reward — palier de streak (+25 crédits tous les 7 jours). Le
  // gate "une fois par jour" ci-dessus empêche déjà tout déclenchement en double.
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    await awardStreakMilestone(user.id, currentStreak);
  }
}

export async function getProfile(discordId: string) {
  return getUserProfile(discordId);
}
