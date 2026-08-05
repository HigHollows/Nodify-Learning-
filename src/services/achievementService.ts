import { awardAchievementUnlocked } from "../credits/rewardService.js";
import {
  getAchievementByKey,
  unlockAchievement as unlockAchievementRepo,
} from "../database/repositories/achievementRepository.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("achievementService");

/**
 * "welcome" se débloque à la toute première interaction avec Nodify — ce
 * n'est pas un vrai accomplissement d'apprentissage, donc pas de Learning
 * Reward dessus (sinon n'importe qui gagnerait des crédits juste en disant
 * bonjour). Tous les autres achievements représentent un vrai jalon.
 */
const NO_REWARD_ACHIEVEMENTS = new Set(["welcome"]);

/**
 * Débloque un succès par sa clé stable (ex: "welcome").
 * Réutilisable par n'importe quel domaine futur (Academy, Cyber Academy...)
 * sans dupliquer la logique d'idempotence. Centralise aussi le Learning
 * Reward associé — un seul endroit à toucher pour tous les achievements.
 */
export async function unlockAchievement(userId: string, key: string): Promise<boolean> {
  const achievement = await getAchievementByKey(key);
  if (!achievement) {
    log.warn({ key }, "Tentative de déblocage d'un succès inconnu");
    return false;
  }

  const unlocked = await unlockAchievementRepo(userId, achievement.id);
  if (unlocked) {
    log.info({ userId, key }, "Succès débloqué");
    if (!NO_REWARD_ACHIEVEMENTS.has(key)) {
      await awardAchievementUnlocked(userId);
    }
  }
  return unlocked;
}
