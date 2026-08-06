import {
  addSkillXp,
} from "../database/repositories/academyRepository.js";
import {
  countSolvedExercises,
  findExerciseByKey,
  listExercises,
  listSolvedExerciseIds,
  recordExerciseSolve,
} from "../database/repositories/exerciseRepository.js";
import { awardExerciseCompleted } from "../credits/rewardService.js";
import { unlockAchievementWithInfo, type UnlockedAchievementInfo } from "../services/achievementService.js";

/** Paliers de badge sur le nombre d'exercices distincts résolus (voir prisma/seed.ts ACHIEVEMENTS). */
const EXERCISE_SOLVE_COUNT_BADGES: { threshold: number; key: string }[] = [
  { threshold: 10, key: "exercise-practitioner" },
];

/** Normalise pour comparer les réponses texte sans se soucier des accents/casse/espaces superflus — même logique que le CTF. */
function normalizeAnswer(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function parseStringArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export interface ExerciseSummary {
  key: string;
  type: string;
  category: string;
  difficulty: number;
  title: string;
  solved: boolean;
}

export async function listExercisesForUser(userId: string): Promise<ExerciseSummary[]> {
  const [exercises, solvedIds] = await Promise.all([listExercises(), listSolvedExerciseIds(userId)]);

  return exercises.map((e) => ({
    key: e.key,
    type: e.type,
    category: e.category,
    difficulty: e.difficulty,
    title: e.title,
    solved: solvedIds.has(e.id),
  }));
}

export interface ExerciseDetail {
  key: string;
  type: string;
  category: string;
  difficulty: number;
  title: string;
  prompt: string;
  choices: string[] | null;
  solved: boolean;
}

export async function getExerciseDetail(key: string, userId: string): Promise<ExerciseDetail | null> {
  const exercise = await findExerciseByKey(key);
  if (!exercise) return null;

  const solvedIds = await listSolvedExerciseIds(userId);

  return {
    key: exercise.key,
    type: exercise.type,
    category: exercise.category,
    difficulty: exercise.difficulty,
    title: exercise.title,
    prompt: exercise.prompt,
    choices: exercise.type === "MCQ" ? parseStringArray(exercise.choices) : null,
    solved: solvedIds.has(exercise.id),
  };
}

export interface ExerciseSubmissionResult {
  correct: boolean;
  alreadySolvedBefore: boolean;
  explanation: string;
  xpAwarded: number;
  unlockedAchievements: UnlockedAchievementInfo[];
}

/**
 * Évalue une réponse MCQ (index de choix) — l'exercice doit être de type "MCQ",
 * sinon `null` (mauvais appelant, pas une erreur utilisateur).
 */
export async function submitMcqAnswer(
  userId: string,
  key: string,
  choiceIndex: number,
): Promise<ExerciseSubmissionResult | null> {
  const exercise = await findExerciseByKey(key);
  if (!exercise || exercise.type !== "MCQ" || exercise.correctIndex === null) return null;

  const correct = choiceIndex === exercise.correctIndex;
  return finalizeSubmission(userId, exercise, correct);
}

/**
 * Évalue une réponse texte libre — l'exercice doit être de type "TEXT",
 * sinon `null` (mauvais appelant, pas une erreur utilisateur).
 */
export async function submitTextAnswer(
  userId: string,
  key: string,
  answer: string,
): Promise<ExerciseSubmissionResult | null> {
  const exercise = await findExerciseByKey(key);
  if (!exercise || exercise.type !== "TEXT") return null;

  const accepted = parseStringArray(exercise.acceptedAnswers).map(normalizeAnswer);
  const correct = accepted.includes(normalizeAnswer(answer));
  return finalizeSubmission(userId, exercise, correct);
}

async function finalizeSubmission(
  userId: string,
  exercise: NonNullable<Awaited<ReturnType<typeof findExerciseByKey>>>,
  correct: boolean,
): Promise<ExerciseSubmissionResult> {
  if (!correct) {
    return { correct: false, alreadySolvedBefore: false, explanation: exercise.explanation, xpAwarded: 0, unlockedAchievements: [] };
  }

  const solvedIds = await listSolvedExerciseIds(userId);
  const alreadySolvedBefore = solvedIds.has(exercise.id);

  await recordExerciseSolve(userId, exercise.id);

  if (alreadySolvedBefore) {
    // Rejouable pour s'entraîner, mais pas de refarm XP/crédits/badges au-delà de la première réussite.
    return { correct: true, alreadySolvedBefore: true, explanation: exercise.explanation, xpAwarded: 0, unlockedAchievements: [] };
  }

  if (exercise.skillKey) {
    await addSkillXp(userId, exercise.skillKey, exercise.xpReward);
  }
  await awardExerciseCompleted(userId); // Learning Reward — exercice résolu (+5 crédits)

  const unlockedAchievements: UnlockedAchievementInfo[] = [];
  const totalSolved = await countSolvedExercises(userId);
  for (const badge of EXERCISE_SOLVE_COUNT_BADGES) {
    if (totalSolved < badge.threshold) continue;
    const info = await unlockAchievementWithInfo(userId, badge.key);
    if (info) unlockedAchievements.push(info);
  }

  return {
    correct: true,
    alreadySolvedBefore: false,
    explanation: exercise.explanation,
    xpAwarded: exercise.skillKey ? exercise.xpReward : 0,
    unlockedAchievements,
  };
}
