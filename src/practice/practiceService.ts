import { listExercises, listSolvedExerciseIds } from "../database/repositories/exerciseRepository.js";
import { listCtfChallenges, listSolvedChallengeIds } from "../database/repositories/ctfRepository.js";
import { getExerciseDetail } from "./exerciseService.js";
import { getChallengeDetail } from "../cybersecurity/ctfService.js";
import { getProfile } from "../services/userService.js";
import { levelForXp } from "../utils/leveling.js";

export type PracticePick = { type: "exercise"; detail: NonNullable<Awaited<ReturnType<typeof getExerciseDetail>>> } | { type: "ctf"; detail: NonNullable<Awaited<ReturnType<typeof getChallengeDetail>>> };

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)]!;
}

/**
 * Pioche un exercice ou un défi CTF non résolu, de difficulté proche du
 * niveau de l'utilisateur (± 1) — réduit la friction de "je veux juste
 * m'entraîner 5 minutes" par rapport à devoir chercher une clé via
 * /search ou parcourir /exercise list. Élargit la fourchette de difficulté
 * si rien de non-résolu n'est trouvé au niveau exact, avant de retomber sur
 * n'importe quoi de non résolu, puis n'importe quoi en dernier recours
 * (utilisateur qui a déjà tout fait au bon niveau).
 */
export async function pickPracticeItem(userId: string): Promise<PracticePick | null> {
  const profile = await getProfile(userId);
  const targetDifficulty = profile ? levelForXp(profile.totalXp).index + 1 : 1;

  const [exercises, challenges, solvedExerciseIds, solvedChallengeIds] = await Promise.all([
    listExercises(),
    listCtfChallenges(),
    listSolvedExerciseIds(userId),
    listSolvedChallengeIds(userId),
  ]);

  type Candidate = { key: string; type: "exercise" | "ctf"; difficulty: number; solved: boolean };
  const pool: Candidate[] = [
    ...exercises.map((e) => ({ key: e.key, type: "exercise" as const, difficulty: e.difficulty, solved: solvedExerciseIds.has(e.id) })),
    ...challenges.map((c) => ({ key: c.key, type: "ctf" as const, difficulty: c.difficulty, solved: solvedChallengeIds.has(c.id) })),
  ];

  const pickFrom = (candidates: Candidate[]) => pickRandom(candidates);

  const chosen =
    pickFrom(pool.filter((c) => !c.solved && Math.abs(c.difficulty - targetDifficulty) <= 1)) ??
    pickFrom(pool.filter((c) => !c.solved)) ??
    pickFrom(pool);

  if (!chosen) return null;

  if (chosen.type === "exercise") {
    const detail = await getExerciseDetail(chosen.key, userId);
    return detail ? { type: "exercise", detail } : null;
  }

  const detail = await getChallengeDetail(chosen.key, userId);
  return detail ? { type: "ctf", detail } : null;
}
