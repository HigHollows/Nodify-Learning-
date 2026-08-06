import { prisma } from "../client.js";

export async function getOrCreateCreditAccount(userId: string) {
  return prisma.userCreditAccount.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function getCreditAccount(userId: string) {
  return prisma.userCreditAccount.findUnique({ where: { userId } });
}

export interface RecordTransactionInput {
  userId: string;
  guildId?: string;
  amount: number;
  type: string;
  status?: string;
  reason: string;
  feature?: string;
  metadata?: string;
}

/**
 * Crédite un montant (toujours accepté — pas de vérification de solde à
 * la hausse) et journalise la transaction. Utilisé pour EARN/BONUS/DAILY/
 * WEEKLY/MONTHLY/LEARNING_REWARD/ACHIEVEMENT/ADMIN_GRANT.
 */
export async function earnCredits(input: RecordTransactionInput) {
  await getOrCreateCreditAccount(input.userId);

  return prisma.$transaction(async (tx) => {
    await tx.userCreditAccount.update({
      where: { userId: input.userId },
      data: { balance: { increment: input.amount }, totalEarned: { increment: input.amount } },
    });

    return tx.creditTransaction.create({
      data: {
        userId: input.userId,
        amount: input.amount,
        type: input.type,
        status: input.status ?? "COMPLETED",
        reason: input.reason,
        ...(input.guildId !== undefined ? { guildId: input.guildId } : {}),
        ...(input.feature !== undefined ? { feature: input.feature } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      },
    });
  });
}

/**
 * Débite un montant de façon ATOMIQUE : la condition `balance >= amount` fait
 * partie de la requête SQL elle-même (`updateMany` avec un `where`), pas
 * d'un "lire puis écrire" côté application qui serait vulnérable à une
 * course entre deux requêtes concurrentes. Si `count === 0`, le solde était
 * insuffisant (ou le compte n'existe pas) — rien n'est modifié.
 *
 * `status: "RESERVED"` par défaut : utilisé pour le cycle réservation/
 * confirmation/remboursement des appels IA (voir creditService.ts).
 */
export async function spendCredits(
  input: RecordTransactionInput,
): Promise<{ transaction: Awaited<ReturnType<typeof earnCredits>>; newBalance: number } | null> {
  await getOrCreateCreditAccount(input.userId);

  return prisma.$transaction(async (tx) => {
    const result = await tx.userCreditAccount.updateMany({
      where: { userId: input.userId, balance: { gte: input.amount } },
      data: { balance: { decrement: input.amount }, totalSpent: { increment: input.amount } },
    });

    if (result.count === 0) return null; // solde insuffisant — rien n'est modifié

    const transaction = await tx.creditTransaction.create({
      data: {
        userId: input.userId,
        amount: -input.amount,
        type: input.type,
        status: input.status ?? "COMPLETED",
        reason: input.reason,
        ...(input.guildId !== undefined ? { guildId: input.guildId } : {}),
        ...(input.feature !== undefined ? { feature: input.feature } : {}),
        ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
      },
    });

    const account = await tx.userCreditAccount.findUniqueOrThrow({
      where: { userId: input.userId },
    });

    return { transaction, newBalance: account.balance };
  });
}

/**
 * Fait passer une transaction RESERVED → COMPLETED. Conditionné sur le statut
 * actuel (`updateMany` avec `where: { status: "RESERVED" }`) pour ne jamais
 * confirmer deux fois, ni confirmer une transaction déjà remboursée.
 */
export async function completeReservation(transactionId: string): Promise<boolean> {
  const result = await prisma.creditTransaction.updateMany({
    where: { id: transactionId, status: "RESERVED" },
    data: { status: "COMPLETED" },
  });
  return result.count > 0;
}

/**
 * Rembourse une réservation : RESERVED → REFUNDED, et restitue le montant au
 * solde. Le `updateMany` conditionné sur `status: "RESERVED"` empêche tout
 * double remboursement (un appel concurrent ou répété ne fait plus rien
 * une fois le statut changé).
 */
export async function refundReservation(transactionId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.creditTransaction.findUnique({ where: { id: transactionId } });
    if (!transaction || transaction.status !== "RESERVED") return false;

    const updated = await tx.creditTransaction.updateMany({
      where: { id: transactionId, status: "RESERVED" },
      data: { status: "REFUNDED" },
    });
    if (updated.count === 0) return false; // déjà changé entre-temps (course évitée)

    const refundAmount = Math.abs(transaction.amount);
    await tx.userCreditAccount.update({
      where: { userId: transaction.userId },
      data: {
        balance: { increment: refundAmount },
        totalRefunded: { increment: refundAmount },
      },
    });

    return true;
  });
}

export async function listTransactions(userId: string, limit: number, offset = 0, type?: string) {
  return prisma.creditTransaction.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });
}

export async function countTransactions(userId: string, type?: string): Promise<number> {
  return prisma.creditTransaction.count({ where: { userId, ...(type ? { type } : {}) } });
}

export interface PeriodStats {
  earned: number;
  spent: number;
  refunded: number;
}

/**
 * Agrège earned/spent/refunded pour un utilisateur depuis une date donnée.
 *
 * Une réservation REMBOURSÉE (status REFUNDED) garde `type: "SPEND"` — seul
 * son statut change tout au long du cycle réservation/confirmation/
 * remboursement (voir creditRepository.refundReservation). Elle ne doit donc
 * PAS compter dans `spent` : les crédits ont été rendus, un échec IA suivi
 * d'un remboursement ne doit jamais gruger le plafond anti-abus quotidien/
 * mensuel de l'utilisateur. RESERVED (en cours) et COMPLETED (confirmée)
 * comptent normalement.
 */
export async function getStatsSince(userId: string, since: Date): Promise<PeriodStats> {
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId, createdAt: { gte: since }, status: { not: "FAILED" } },
    select: { amount: true, type: true, status: true },
  });

  let earned = 0;
  let spent = 0;
  let refunded = 0;

  for (const t of transactions) {
    if (t.type === "REFUND") refunded += t.amount;
    else if (t.amount > 0) earned += t.amount;
    else if (t.status !== "REFUNDED") spent += Math.abs(t.amount);
  }

  return { earned, spent, refunded };
}

/**
 * Dépense IA agrégée de TOUS les utilisateurs sur une guild donnée, depuis
 * une date — voir credits/aiBudgetAlertService.ts. Même filtrage que
 * getStatsSince (exclut FAILED et les réservations REFUNDED), mais groupé
 * par guildId au lieu de userId : c'est un signal d'ensemble pour
 * l'admin, PAS le plafond réellement appliqué (qui reste par-utilisateur,
 * voir creditService.reserveForFeature).
 */
export async function getGuildAiSpendSince(guildId: string, since: Date): Promise<number> {
  const transactions = await prisma.creditTransaction.findMany({
    where: { guildId, createdAt: { gte: since }, status: { not: "FAILED" }, type: "SPEND" },
    select: { amount: true, status: true },
  });

  let spent = 0;
  for (const t of transactions) {
    if (t.status !== "REFUNDED") spent += Math.abs(t.amount);
  }
  return spent;
}

export async function countAiRequestsSince(userId: string, since: Date): Promise<number> {
  return prisma.aICall.count({ where: { userId, createdAt: { gte: since } } });
}

export async function getMostUsedFeature(userId: string): Promise<string | null> {
  const grouped = await prisma.aICall.groupBy({
    by: ["feature"],
    where: { userId },
    _count: { feature: true },
    orderBy: { _count: { feature: "desc" } },
    take: 1,
  });
  return grouped[0]?.feature ?? null;
}
