import { prisma } from "../client.js";

export async function createFeedbackReport(userId: string, guildId: string | null, message: string) {
  return prisma.feedbackReport.create({ data: { userId, guildId, message } });
}

export async function listRecentFeedbackReports(limit: number) {
  return prisma.feedbackReport.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { username: true } } },
  });
}
