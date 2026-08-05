import { prisma } from "../client.js";

/**
 * Crée le User s'il n'existe pas encore, ou met simplement à jour son
 * username (peut changer côté Discord entre deux interactions).
 * Retourne aussi `isNew` pour permettre de déclencher des effets de bord
 * (ex: achievement "Bienvenue") uniquement à la toute première interaction.
 */
export async function getOrCreateUser(discordId: string, username: string) {
  const existing = await prisma.user.findUnique({ where: { id: discordId } });

  if (existing) {
    if (existing.username !== username) {
      await prisma.user.update({ where: { id: discordId }, data: { username } });
    }
    return { user: existing, isNew: false };
  }

  const user = await prisma.user.create({ data: { id: discordId, username } });
  return { user, isNew: true };
}

export async function updateStreak(
  discordId: string,
  data: { currentStreak: number; longestStreak: number; lastActiveDate: string },
) {
  return prisma.user.update({ where: { id: discordId }, data });
}

export async function getUserProfile(discordId: string) {
  return prisma.user.findUnique({
    where: { id: discordId },
    include: {
      skills: { include: { skill: true }, orderBy: { xp: "desc" } },
      achievements: { include: { achievement: true }, orderBy: { earnedAt: "asc" } },
    },
  });
}

/**
 * Top utilisateurs par XP globale (toutes guildes confondues — le profil
 * Nodify est global, voir Phase 3). Le filtrage à l'affichage aux seuls
 * membres présents sur la guild courante se fait côté commande, pas ici.
 */
export async function listTopUsersByXp(limit: number) {
  return prisma.user.findMany({
    where: { totalXp: { gt: 0 } },
    orderBy: { totalXp: "desc" },
    take: limit,
  });
}

/**
 * Statut "supporter" non-monétaire (attribué par un admin, pas acheté — les
 * crédits ne sont pas une monnaie réelle). Donne un bonus sur la récompense
 * MONTHLY — voir rewardService.ts.
 */
export async function setSupporterStatus(discordId: string, isSupporter: boolean): Promise<void> {
  await prisma.user.update({ where: { id: discordId }, data: { isSupporter } });
}

export async function isSupporter(discordId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: discordId }, select: { isSupporter: true } });
  return user?.isSupporter ?? false;
}
