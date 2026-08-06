import { prisma } from "../client.js";

export async function findConceptByKey(key: string) {
  return prisma.concept.findUnique({ where: { key } });
}

export async function findConceptsByKeys(keys: string[]) {
  if (keys.length === 0) return [];
  return prisma.concept.findMany({ where: { key: { in: keys } } });
}

export async function findAliasTerm(termLower: string) {
  return prisma.conceptAlias.findUnique({
    where: { term: termLower },
    include: { concept: true },
  });
}

/** Version légère de tous les concepts, pour la recherche floue en mémoire. */
export async function listConceptsLite() {
  return prisma.concept.findMany({ select: { id: true, key: true, name: true } });
}

/** Tous les alias, pour que la recherche floue les considère aussi. */
export async function listAliasesLite() {
  const aliases = await prisma.conceptAlias.findMany({
    select: { term: true, concept: { select: { key: true } } },
  });
  return aliases.map((a) => ({ term: a.term, conceptKey: a.concept.key }));
}

export async function countConcepts() {
  return prisma.concept.count();
}

/** Fouille par titre/définition — utilisé par /search (recherche unifiée, voir search/searchService.ts). */
export async function listConceptsForSearch() {
  return prisma.concept.findMany({ select: { key: true, name: true, category: true, definition: true } });
}

/** Enregistre/rafraîchit la consultation d'un concept par un utilisateur — alimente la révision espacée (/review). */
export async function recordConceptView(userId: string, conceptId: string): Promise<void> {
  await prisma.userConceptView.upsert({
    where: { userId_conceptId: { userId, conceptId } },
    create: { userId, conceptId },
    // `viewedAt` explicite : un `update: {}` vide ne génère aucune écriture
    // réelle (rien à SET), donc `@updatedAt` ne se déclenche jamais tout
    // seul dans ce cas — il faut le forcer explicitement.
    update: { viewedAt: new Date() },
  });
}

/**
 * Concepts vus par l'utilisateur il y a au moins `minDaysAgo` jours,
 * triés du plus ancien au plus récent (les meilleurs candidats à revoir
 * en premier) — voir progression/spacedRepetitionService.ts.
 */
export async function listConceptsDueForReview(userId: string, minDaysAgo: Date, limit: number) {
  return prisma.userConceptView.findMany({
    where: { userId, viewedAt: { lte: minDaysAgo } },
    orderBy: { viewedAt: "asc" },
    take: limit,
    include: { concept: { select: { key: true, name: true, definition: true } } },
  });
}
