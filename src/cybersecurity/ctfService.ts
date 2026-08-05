import {
  findCtfChallengeByKey,
  listCtfChallenges,
  listCtfLeaderboard,
  listSolvedChallengeIds,
  recordCtfSolve,
  type CtfLeaderboardRow,
} from "../database/repositories/ctfRepository.js";
import { unlockAchievement } from "../services/achievementService.js";

/** Normalise pour comparer les réponses sans se soucier des accents/casse/espaces superflus. */
function normalizeAnswer(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function parseAcceptedAnswers(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export interface CtfChallengeSummary {
  key: string;
  category: string;
  difficulty: number;
  title: string;
  points: number;
  solved: boolean;
}

export async function listChallengesForUser(userId: string): Promise<CtfChallengeSummary[]> {
  const [challenges, solvedIds] = await Promise.all([
    listCtfChallenges(),
    listSolvedChallengeIds(userId),
  ]);

  return challenges.map((c) => ({
    key: c.key,
    category: c.category,
    difficulty: c.difficulty,
    title: c.title,
    points: c.points,
    solved: solvedIds.has(c.id),
  }));
}

export interface CtfChallengeDetail {
  key: string;
  category: string;
  difficulty: number;
  title: string;
  description: string;
  hint: string | null;
  points: number;
  solved: boolean;
}

export async function getChallengeDetail(
  key: string,
  userId: string,
): Promise<CtfChallengeDetail | null> {
  const challenge = await findCtfChallengeByKey(key);
  if (!challenge) return null;

  const solvedIds = await listSolvedChallengeIds(userId);

  return {
    key: challenge.key,
    category: challenge.category,
    difficulty: challenge.difficulty,
    title: challenge.title,
    description: challenge.description,
    hint: challenge.hint,
    points: challenge.points,
    solved: solvedIds.has(challenge.id),
  };
}

export interface FlagSubmissionResult {
  correct: boolean;
  alreadySolved: boolean;
  points: number;
  achievementUnlocked: boolean;
}

export async function submitFlag(
  userId: string,
  key: string,
  answer: string,
): Promise<FlagSubmissionResult | null> {
  const challenge = await findCtfChallengeByKey(key);
  if (!challenge) return null;

  const accepted = parseAcceptedAnswers(challenge.acceptedAnswers).map(normalizeAnswer);
  const correct = accepted.includes(normalizeAnswer(answer));

  if (!correct) {
    return { correct: false, alreadySolved: false, points: 0, achievementUnlocked: false };
  }

  const newlySolved = await recordCtfSolve(userId, challenge.id);
  if (!newlySolved) {
    return { correct: true, alreadySolved: true, points: 0, achievementUnlocked: false };
  }

  const achievementUnlocked = await unlockAchievement(userId, "first-flag");
  return { correct: true, alreadySolved: false, points: challenge.points, achievementUnlocked };
}

export async function getLeaderboard(limit: number): Promise<CtfLeaderboardRow[]> {
  return listCtfLeaderboard(limit);
}
