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
