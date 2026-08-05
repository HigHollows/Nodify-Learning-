import { Prisma } from "@prisma/client";
import { prisma } from "../client.js";

export async function getAchievementByKey(key: string) {
  return prisma.achievement.findUnique({ where: { key } });
}

export async function countAchievements() {
  return prisma.achievement.count();
}

/**
 * Débloque un succès pour un utilisateur. Idempotent : si déjà débloqué,
 * ne fait rien et retourne `false` — repose sur la contrainte unique
 * (userId, achievementId) plutôt que sur un check-then-create pour éviter
 * une race condition entre la vérification et la création.
 */
export async function unlockAchievement(
  userId: string,
  achievementId: string,
): Promise<boolean> {
  try {
    await prisma.userAchievement.create({ data: { userId, achievementId } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false; // déjà débloqué
    }
    throw error;
  }
}
