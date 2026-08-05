import { prisma } from "../client.js";

export async function createAuditLog(input: {
  adminId: string;
  action: string;
  targetUserId?: string;
  reason?: string;
  metadata?: string;
}) {
  return prisma.adminAuditLog.create({ data: input });
}

export interface AuditLogFilter {
  adminId?: string;
  action?: string;
}

/** Historique paginé — `/ai audit-log`, seule vue possible sur AdminAuditLog depuis Discord. */
export async function listAuditLogs(filter: AuditLogFilter, limit: number, offset = 0) {
  const where = {
    ...(filter.adminId ? { adminId: filter.adminId } : {}),
    ...(filter.action ? { action: filter.action } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.adminAuditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip: offset }),
    prisma.adminAuditLog.count({ where }),
  ]);

  return { entries, total };
}
