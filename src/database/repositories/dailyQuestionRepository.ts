import { Prisma } from "@prisma/client";
import { prisma } from "../client.js";

export async function listAllDailyQuestions() {
  return prisma.dailyQuestion.findMany();
}

export async function findDailyQuestionByKey(key: string) {
  return prisma.dailyQuestion.findUnique({ where: { key } });
}

/** Guilds ayant activé la Question du jour et possédant une config (donc un /setup déjà fait). */
export async function listGuildsWithDailyQuestionEnabled() {
  return prisma.guildConfig.findMany({ where: { dailyQuestionEnabled: true } });
}

export async function markGuildDailyQuestionPosted(
  guildId: string,
  date: string,
  questionKey: string,
): Promise<void> {
  await prisma.guildConfig.update({
    where: { guildId },
    data: { lastDailyQuestionDate: date, lastDailyQuestionKey: questionKey },
  });
}

/**
 * Enregistre la réponse d'un utilisateur à la question du jour d'une guild.
 * Idempotent via la contrainte unique (userId, guildId, date) : si déjà
 * répondu aujourd'hui, retourne `false` sans rien écraser.
 */
export async function recordDailyAnswer(
  userId: string,
  guildId: string,
  date: string,
  correct: boolean,
  category: string | null = null,
): Promise<boolean> {
  try {
    await prisma.dailyQuestionAnswer.create({ data: { userId, guildId, date, correct, category } });
    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return false; // déjà répondu aujourd'hui sur cette guild
    }
    throw error;
  }
}

export async function getDailyAnswer(userId: string, guildId: string, date: string) {
  return prisma.dailyQuestionAnswer.findUnique({
    where: { userId_guildId_date: { userId, guildId, date } },
  });
}
