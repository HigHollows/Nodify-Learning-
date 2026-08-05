/**
 * Types de transactions de crédits — stockés en String (SQLite ne supporte
 * pas les enums natifs Prisma, pattern déjà utilisé partout ailleurs dans
 * Nodify, ex: SkillCategory).
 */
export const TRANSACTION_TYPES = [
  "EARN",
  "SPEND",
  "REFUND",
  "BONUS",
  "ADMIN_GRANT",
  "ADMIN_REMOVE",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "LEARNING_REWARD",
  "ACHIEVEMENT",
  "SYSTEM_ADJUSTMENT",
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ["RESERVED", "COMPLETED", "REFUNDED", "FAILED"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const REWARD_TYPES = ["DAILY", "WEEKLY", "MONTHLY"] as const;
export type RewardType = (typeof REWARD_TYPES)[number];

/** Intention admin — persistée en base (SystemConfig), pas en .env : doit changer sans redémarrage. */
export const AI_MODES = ["OPEN", "LIMITED", "MAINTENANCE", "CLOSED"] as const;
export type AIMode = (typeof AI_MODES)[number];

/** Statut affiché publiquement — calculé (mode admin + télémétrie réelle), jamais stocké tel quel. */
export const AI_STATUSES = [
  "OPERATIONAL",
  "DEGRADED",
  "LIMITED",
  "OFFLINE",
  "MAINTENANCE",
  "QUOTA",
  "ERROR",
] as const;
export type AIStatus = (typeof AI_STATUSES)[number];
