import { prisma } from "../client.js";

export interface AICallInput {
  userId: string;
  guildId?: string;
  feature: string;
  provider: string;
  model?: string;
  status: "SUCCESS" | "ERROR" | "TIMEOUT";
  creditCost: number;
  refunded?: boolean;
  latencyMs?: number;
  errorMessage?: string;
}

export async function logAiCall(input: AICallInput): Promise<void> {
  await prisma.aICall.create({
    data: {
      userId: input.userId,
      feature: input.feature,
      provider: input.provider,
      status: input.status,
      creditCost: input.creditCost,
      refunded: input.refunded ?? false,
      ...(input.guildId !== undefined ? { guildId: input.guildId } : {}),
      ...(input.model !== undefined ? { model: input.model } : {}),
      ...(input.latencyMs !== undefined ? { latencyMs: input.latencyMs } : {}),
      ...(input.errorMessage !== undefined ? { errorMessage: input.errorMessage.slice(0, 500) } : {}),
    },
  });
}

export interface UsageStats {
  requestCount: number;
  creditsSpent: number;
  errorCount: number;
  refundedCount: number;
}

export async function getUsageStatsSince(since: Date): Promise<UsageStats> {
  const calls = await prisma.aICall.findMany({
    where: { createdAt: { gte: since } },
    select: { status: true, creditCost: true, refunded: true },
  });

  let creditsSpent = 0;
  let errorCount = 0;
  let refundedCount = 0;

  for (const call of calls) {
    if (call.status !== "SUCCESS") errorCount++;
    if (call.refunded) refundedCount++;
    else creditsSpent += call.creditCost;
  }

  return { requestCount: calls.length, creditsSpent, errorCount, refundedCount };
}

export async function getTopFeaturesSince(
  since: Date,
  limit: number,
): Promise<{ feature: string; count: number }[]> {
  const grouped = await prisma.aICall.groupBy({
    by: ["feature"],
    where: { createdAt: { gte: since } },
    _count: { feature: true },
    orderBy: { _count: { feature: "desc" } },
    take: limit,
  });

  return grouped.map((g) => ({ feature: g.feature, count: g._count.feature }));
}

export interface AiUsageFilter {
  since?: Date;
  userId?: string;
  feature?: string;
}

export async function listAiCalls(filter: AiUsageFilter, limit: number) {
  return prisma.aICall.findMany({
    where: {
      ...(filter.since ? { createdAt: { gte: filter.since } } : {}),
      ...(filter.userId ? { userId: filter.userId } : {}),
      ...(filter.feature ? { feature: filter.feature } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
