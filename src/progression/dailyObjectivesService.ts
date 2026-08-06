import { hasCompletedLessonSince } from "../database/repositories/academyRepository.js";
import { hasSolvedChallengeSince } from "../database/repositories/ctfRepository.js";
import { getDailyAnswer } from "../database/repositories/dailyQuestionRepository.js";
import { hasSolvedExerciseSince } from "../database/repositories/exerciseRepository.js";
import { startOfTodayUtc, todayUtc } from "../utils/date.js";

/**
 * Objectifs quotidiens (Phase 10) : un simple récapitulatif de l'engagement
 * du jour, calculé à la volée depuis les tables déjà existantes (aucune
 * nouvelle table nécessaire — la vérité reste les vraies actions
 * enregistrées : DailyQuestionAnswer/UserLessonCompletion/CtfSolve/
 * UserExerciseCompletion). Purement informatif, pas de récompense propre :
 * chaque action compte déjà pour son propre système de récompense — les
 * objectifs ne font qu'agréger une vue d'ensemble du jour.
 */
export interface DailyObjective {
  key: string;
  label: string;
  completed: boolean;
}

/**
 * `guildId` optionnel : la question du jour est un concept par-serveur
 * (DailyQuestionAnswer est scopé à une guild) — en DM (guildId null), cet
 * objectif est omis plutôt que de renvoyer un faux "non complété".
 */
export async function getDailyObjectives(userId: string, guildId: string | null): Promise<DailyObjective[]> {
  const since = startOfTodayUtc();

  const [lessonDone, ctfDone, exerciseDone, dailyQuestionDone] = await Promise.all([
    hasCompletedLessonSince(userId, since),
    hasSolvedChallengeSince(userId, since),
    hasSolvedExerciseSince(userId, since),
    guildId ? getDailyAnswer(userId, guildId, todayUtc()).then((a) => a !== null) : Promise.resolve(null),
  ]);

  const objectives: DailyObjective[] = [
    { key: "lesson", label: "Terminer une leçon Academy", completed: lessonDone },
    { key: "exercise", label: "Résoudre un exercice pratique", completed: exerciseDone },
    { key: "ctf", label: "Résoudre un défi CTF", completed: ctfDone },
  ];

  if (dailyQuestionDone !== null) {
    objectives.unshift({ key: "daily-question", label: "Répondre à la question du jour", completed: dailyQuestionDone });
  }

  return objectives;
}
