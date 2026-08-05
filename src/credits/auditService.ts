import { createAuditLog } from "../database/repositories/auditLogRepository.js";
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
