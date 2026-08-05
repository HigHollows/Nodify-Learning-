import { prisma } from "../client.js";
import { env } from "../../config/env.js";

const SINGLETON_ID = "singleton";

/** Crée la ligne de config au tout premier accès, avec le mode par défaut défini en .env. */
export async function getOrCreateSystemConfig() {
  return prisma.systemConfig.upsert({
    where: { id: SINGLETON_ID },
    create: { id: SINGLETON_ID, aiMode: env.AI_DEFAULT_MODE },
    update: {},
  });
}

export async function setAiMode(
  mode: string,
  data: { reason?: string | null; since?: Date | null } = {},
) {
  await getOrCreateSystemConfig();
  return prisma.systemConfig.update({
    where: { id: SINGLETON_ID },
    data: {
      aiMode: mode,
      maintenanceReason: data.reason ?? null,
      maintenanceSince: data.since ?? null,
    },
  });
}

export async function recordSuccessfulRequest(): Promise<void> {
  await getOrCreateSystemConfig();
  await prisma.systemConfig.update({
    where: { id: SINGLETON_ID },
    data: { lastSuccessfulRequestAt: new Date() },
  });
}

export async function recordFailedRequest(errorMessage: string, errorCode?: string): Promise<void> {
  await getOrCreateSystemConfig();
  await prisma.systemConfig.update({
    where: { id: SINGLETON_ID },
    data: {
      lastErrorAt: new Date(),
      lastErrorMessage: errorMessage.slice(0, 300),
      ...(errorCode !== undefined ? { lastErrorCode: errorCode } : {}),
    },
  });
}

export async function setStatusPanelLocation(channelId: string, messageId: string): Promise<void> {
  await getOrCreateSystemConfig();
  await prisma.systemConfig.update({
    where: { id: SINGLETON_ID },
    data: { statusChannelId: channelId, statusMessageId: messageId },
  });
}

/** Dernier statut public pour lequel une alerte "AI Incident" a déjà été envoyée. */
export async function setLastNotifiedStatus(status: string): Promise<void> {
  await getOrCreateSystemConfig();
  await prisma.systemConfig.update({
    where: { id: SINGLETON_ID },
    data: { lastNotifiedStatus: status },
  });
}
