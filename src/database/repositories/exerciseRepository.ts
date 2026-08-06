import { prisma } from "../client.js";

export async function listExercises() {
  return prisma.exercise.findMany({ orderBy: { difficulty: "asc" } });
}

export async function findExerciseByKey(key: string) {
  return prisma.exercise.findUnique({ where: { key } });
}

export async function listSolvedExerciseIds(userId: string): Promise<Set<string>> {
  const solves = await prisma.userExerciseCompletion.findMany({
    where: { userId },
    select: { exerciseId: true },
  });
  return new Set(solves.map((s) => s.exerciseId));
}

/**
 * Idempotent côté récompense (voir exerciseService.submitAnswer) : contrairement
 * au CTF/à la leçon, on ne bloque PAS un ré-essai — un exercice est fait pour
 * s'entraîner plusieurs fois. `upsert` met juste à jour `solvedAt`, l'appelant
 * décide via un check préalable (déjà résolu ou non) si la récompense doit
 * être attribuée cette fois-ci.
 */
export async function recordExerciseSolve(userId: string, exerciseId: string): Promise<void> {
  await prisma.userExerciseCompletion.upsert({
    where: { userId_exerciseId: { userId, exerciseId } },
    create: { userId, exerciseId },
    update: { solvedAt: new Date() },
  });
}

export async function countSolvedExercises(userId: string): Promise<number> {
  return prisma.userExerciseCompletion.count({ where: { userId } });
}
