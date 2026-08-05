import { Prisma } from "@prisma/client";
import { prisma } from "../client.js";

export async function listCtfChallenges() {
  return prisma.ctfChallenge.findMany({ orderBy: { difficulty: "asc" } });
}

export async function findCtfChallengeByKey(key: string) {
  return prisma.ctfChallenge.findUnique({ where: { key } });
}

export async function listSolvedChallengeIds(userId: string): Promise<Set<string>> {
  const solves = await prisma.ctfSolve.findMany({
    where: { userId },
    select: { challengeId: true },
  });
  return new Set(solves.map((s) => s.challengeId));
}

/** Idempotent : retourne `false` si déjà résolu, plutôt que d'attribuer les points deux fois. */
export async function recordCtfSolve(userId: string, challengeId: string): Promise<boolean> {
  try {
    await prisma.ctfSolve.create({ data: { userId, challengeId } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false;
    }
    throw error;
  }
}

export interface CtfLeaderboardRow {
  userId: string;
  username: string;
  totalPoints: number;
  solvedCount: number;
}

/** Classement CTF : agrège les points par utilisateur via ses résolutions. */
export async function listCtfLeaderboard(limit: number): Promise<CtfLeaderboardRow[]> {
  const solves = await prisma.ctfSolve.findMany({
    include: { user: { select: { username: true } }, challenge: { select: { points: true } } },
  });

  const byUser = new Map<string, CtfLeaderboardRow>();
  for (const solve of solves) {
    const existing = byUser.get(solve.userId);
    if (existing) {
      existing.totalPoints += solve.challenge.points;
      existing.solvedCount += 1;
    } else {
      byUser.set(solve.userId, {
        userId: solve.userId,
        username: solve.user.username,
        totalPoints: solve.challenge.points,
        solvedCount: 1,
      });
    }
  }

  return [...byUser.values()].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, limit);
}
