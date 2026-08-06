import {
  findCtfChallengeByKey,
  listCtfChallenges,
  listCtfLeaderboard,
  listSolvedChallengeIds,
  recordCtfSolve,
  type CtfLeaderboardRow,
} from "../database/repositories/ctfRepository.js";
import { awardChallengeCompleted } from "../credits/rewardService.js";
import { unlockAchievementWithInfo, type UnlockedAchievementInfo } from "../services/achievementService.js";

/** Paliers de badges CTF (voir prisma/seed.ts ACHIEVEMENTS), évalués sur le nombre total de défis résolus après chaque nouvelle résolution. */
const CTF_SOLVE_COUNT_BADGES: { threshold: number; key: string }[] = [
  { threshold: 5, key: "ctf-solver" },
  { threshold: 15, key: "ctf-master" },
];

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
  unlockedAchievements: UnlockedAchievementInfo[];
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
    return { correct: false, alreadySolved: false, points: 0, unlockedAchievements: [] };
  }

  const newlySolved = await recordCtfSolve(userId, challenge.id);
  if (!newlySolved) {
    return { correct: true, alreadySolved: true, points: 0, unlockedAchievements: [] };
  }

  const unlockedAchievements: UnlockedAchievementInfo[] = [];
  const firstFlagInfo = await unlockAchievementWithInfo(userId, "first-flag");
  if (firstFlagInfo) unlockedAchievements.push(firstFlagInfo);

  // +1 car recordCtfSolve vient tout juste d'enregistrer CETTE résolution.
  const totalSolved = (await listSolvedChallengeIds(userId)).size;
  for (const badge of CTF_SOLVE_COUNT_BADGES) {
    if (totalSolved < badge.threshold) continue;
    const info = await unlockAchievementWithInfo(userId, badge.key);
    if (info) unlockedAchievements.push(info);
  }

  await awardChallengeCompleted(userId); // Learning Reward — challenge terminé (+10 crédits)
  return { correct: true, alreadySolved: false, points: challenge.points, unlockedAchievements };
}

export async function getLeaderboard(limit: number): Promise<CtfLeaderboardRow[]> {
  return listCtfLeaderboard(limit);
}
