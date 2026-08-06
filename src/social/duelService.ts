import { randomUUID } from "node:crypto";
import { listAllDailyQuestions } from "../database/repositories/dailyQuestionRepository.js";
import { shuffleChoices } from "../utils/quizShuffle.js";

/**
 * Duels de trivia 1v1 — état en mémoire, volontairement non persisté : un
 * duel est une partie live de quelques dizaines de secondes, pas une
 * donnée qui a besoin de survivre à un redémarrage. Si le bot redémarre
 * pendant un duel en cours, il est simplement perdu (aucune stat de
 * victoire n'est promise nulle part — pas une capacité à moitié
 * fabriquée, juste un choix de portée assumé).
 */
export type DuelStatus = "pending" | "active" | "finished";

export interface DuelState {
  id: string;
  challengerId: string;
  opponentId: string;
  guildId: string;
  status: DuelStatus;
  question?: { prompt: string; choices: string[]; correctIndex: number; explanation: string };
  failedUserIds: Set<string>;
  createdAt: number;
}

const duels = new Map<string, DuelState>();

const PENDING_TIMEOUT_MS = 2 * 60 * 1000;
const ANSWER_TIMEOUT_MS = 30 * 1000;

export function createDuel(challengerId: string, opponentId: string, guildId: string): DuelState {
  const duel: DuelState = {
    id: randomUUID(),
    challengerId,
    opponentId,
    guildId,
    status: "pending",
    failedUserIds: new Set(),
    createdAt: Date.now(),
  };
  duels.set(duel.id, duel);

  setTimeout(() => {
    const current = duels.get(duel.id);
    if (current?.status === "pending") duels.delete(duel.id);
  }, PENDING_TIMEOUT_MS);

  return duel;
}

export function getDuel(id: string): DuelState | undefined {
  return duels.get(id);
}

export function declineDuel(id: string): void {
  duels.delete(id);
}

/** Pioche une question aléatoire (mélange déterministe seedé par l'id du duel — voir quizShuffle.ts) et démarre le duel. */
export async function activateDuel(id: string): Promise<DuelState | null> {
  const duel = duels.get(id);
  if (!duel || duel.status !== "pending") return null;

  const questions = await listAllDailyQuestions();
  if (questions.length === 0) return null;

  const picked = questions[Math.floor(Math.random() * questions.length)]!;
  const choices = JSON.parse(picked.choices) as string[];
  const { choices: shuffled, correctIndex } = shuffleChoices(duel.id, choices, picked.correctIndex);

  duel.status = "active";
  duel.question = { prompt: picked.prompt, choices: shuffled, correctIndex, explanation: picked.explanation };

  setTimeout(() => {
    const current = duels.get(id);
    if (current?.status === "active") duels.delete(id);
  }, ANSWER_TIMEOUT_MS);

  return duel;
}

export type AnswerOutcome =
  | { result: "win"; winnerId: string; explanation: string }
  | { result: "draw"; explanation: string }
  | { result: "wrong" }
  | { result: "already-failed" }
  | { result: "not-your-duel" }
  | { result: "duel-over" };

/** Évalue une tentative de réponse — termine le duel immédiatement en cas de victoire ou si les deux joueurs ont épuisé leur chance. */
export function answerDuel(id: string, userId: string, choiceIndex: number): AnswerOutcome {
  const duel = duels.get(id);
  if (!duel || duel.status !== "active" || !duel.question) return { result: "duel-over" };
  if (userId !== duel.challengerId && userId !== duel.opponentId) return { result: "not-your-duel" };
  if (duel.failedUserIds.has(userId)) return { result: "already-failed" };

  if (choiceIndex === duel.question.correctIndex) {
    const explanation = duel.question.explanation;
    duel.status = "finished";
    duels.delete(id);
    return { result: "win", winnerId: userId, explanation };
  }

  duel.failedUserIds.add(userId);
  const bothFailed = duel.failedUserIds.has(duel.challengerId) && duel.failedUserIds.has(duel.opponentId);
  if (bothFailed) {
    const explanation = duel.question.explanation;
    duel.status = "finished";
    duels.delete(id);
    return { result: "draw", explanation };
  }
  return { result: "wrong" };
}
