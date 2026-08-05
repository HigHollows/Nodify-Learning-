import {
  getAchievementByKey,
  unlockAchievement as unlockAchievementRepo,
} from "../database/repositories/achievementRepository.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("achievementService");

/**
 * Débloque un succès par sa clé stable (ex: "welcome").
 * Réutilisable par n'importe quel domaine futur (Academy, Cyber Academy...)
 * sans dupliquer la logique d'idempotence.
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
  }
  return unlocked;
}
