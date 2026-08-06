import { Prisma } from "@prisma/client";
import { prisma } from "../client.js";

export async function getAchievementByKey(key: string) {
  return prisma.achievement.findUnique({ where: { key } });
}

export async function countAchievements() {
  return prisma.achievement.count();
}

/** Catalogue complet — utilisé par /achievements pour afficher aussi les badges pas encore débloqués. */
export async function listAllAchievements() {
  return prisma.achievement.findMany({ orderBy: { key: "asc" } });
}

/** Clés des succès déjà débloqués par un utilisateur — pour croiser avec listAllAchievements(). */
export async function listEarnedAchievementKeys(userId: string): Promise<Set<string>> {
  const rows = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievement: { select: { key: true } } },
  });
  return new Set(rows.map((r) => r.achievement.key));
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
