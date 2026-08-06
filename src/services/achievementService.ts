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

export interface UnlockedAchievementInfo {
  name: string;
  icon: string;
}

/**
 * Comme `unlockAchievement`, mais retourne le nom/icône du succès pour un
 * affichage dynamique (ex: liste de badges débloqués après un cours/CTF)
 * plutôt qu'un texte codé en dur par succès dans chaque vue appelante.
 * `null` si le succès est inconnu OU déjà débloqué (rien de nouveau à afficher).
 */
export async function unlockAchievementWithInfo(
  userId: string,
  key: string,
): Promise<UnlockedAchievementInfo | null> {
  const achievement = await getAchievementByKey(key);
  if (!achievement) {
    log.warn({ key }, "Tentative de déblocage d'un succès inconnu");
    return null;
  }

  const unlocked = await unlockAchievementRepo(userId, achievement.id);
  if (!unlocked) return null;

  log.info({ userId, key }, "Succès débloqué");
  if (!NO_REWARD_ACHIEVEMENTS.has(key)) {
    await awardAchievementUnlocked(userId);
  }
  return { name: achievement.name, icon: achievement.icon };
}
