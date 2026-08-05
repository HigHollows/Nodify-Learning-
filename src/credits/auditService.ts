import { createAuditLog, listAuditLogs } from "../database/repositories/auditLogRepository.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("auditService");

/**
 * Journalise une action administrative sensible (AI Control Center, Credit
 * Admin Grants). Jamais d'action admin sans trace — voir spec Nodify.
 */
export async function logAdminAction(
  adminId: string,
  action: string,
  data: { targetUserId?: string; reason?: string; metadata?: Record<string, unknown> } = {},
): Promise<void> {
  await createAuditLog({
    adminId,
    action,
    ...(data.targetUserId !== undefined ? { targetUserId: data.targetUserId } : {}),
    ...(data.reason !== undefined ? { reason: data.reason } : {}),
    ...(data.metadata !== undefined ? { metadata: JSON.stringify(data.metadata) } : {}),
  });
  log.info({ adminId, action, ...data }, "Action admin journalisée");
}

export interface AuditLogPage {
  entries: {
    adminId: string;
    action: string;
    targetUserId: string | null;
    reason: string | null;
    createdAt: Date;
  }[];
  total: number;
}

/**
 * Seule façon de consulter AdminAuditLog depuis Discord (`/ai audit-log`) —
 * jusqu'ici il n'existait qu'en écriture, un admin ne pouvait le lire qu'en
 * ouvrant Prisma Studio directement sur le serveur.
 */
export async function getAuditLogPage(
  limit: number,
  offset: number,
  filter: { adminId?: string; action?: string } = {},
): Promise<AuditLogPage> {
  return listAuditLogs(filter, limit, offset);
}
