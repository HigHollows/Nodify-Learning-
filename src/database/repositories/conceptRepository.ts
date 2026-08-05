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
