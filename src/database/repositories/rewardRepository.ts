import { prisma } from "../client.js";

export async function getLatestClaim(userId: string, rewardType: string) {
  return prisma.rewardClaim.findFirst({
    where: { userId, rewardType },
    orderBy: { claimedAt: "desc" },
  });
}

export async function createClaim(
  userId: string,
  rewardType: string,
  amount: number,
  nextAvailableAt: Date,
) {
  return prisma.rewardClaim.create({
    data: { userId, rewardType, amount, nextAvailableAt },
  });
}

export type ClaimAttempt =
  | { claimed: true; nextAvailableAt: Date }
  | { claimed: false; nextAvailableAt: Date };

/**
 * Vérifie le cooldown ET crée la nouvelle ligne de claim dans UNE seule
 * transaction Prisma — le cooldown est donc vérifié côté serveur/DB, jamais
 * seulement côté Discord, et une double tentative rapprochée (double-clic)
 * ne peut pas passer deux fois : SQLite sérialise les transactions d'écriture.
 */
export async function tryClaimReward(
  userId: string,
  rewardType: string,
  amount: number,
  cooldownMs: number,
): Promise<ClaimAttempt> {
  return prisma.$transaction(async (tx) => {
    const latest = await tx.rewardClaim.findFirst({
      where: { userId, rewardType },
      orderBy: { claimedAt: "desc" },
    });

    const now = new Date();
    if (latest && latest.nextAvailableAt > now) {
      return { claimed: false, nextAvailableAt: latest.nextAvailableAt };
    }

    const nextAvailableAt = new Date(now.getTime() + cooldownMs);
    await tx.rewardClaim.create({ data: { userId, rewardType, amount, nextAvailableAt } });
    return { claimed: true, nextAvailableAt };
  });
}
