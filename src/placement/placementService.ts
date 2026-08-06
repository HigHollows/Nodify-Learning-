import { listCourses } from "../database/repositories/academyRepository.js";
import { labelForLevelOrder } from "../utils/leveling.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../types/skill.js";
import { PLACEMENT_QUESTIONS, type PlacementQuestion } from "./placementQuestions.js";

/**
 * État du test de positionnement — en mémoire, comme les duels
 * (social/duelService.ts) : une évaluation de quelques minutes, pas une
 * donnée qui doit survivre à un redémarrage. Un seul test actif par
 * utilisateur à la fois (relancer /placement écrase la tentative en cours).
 */
interface PlacementSession {
  answers: { category: SkillCategory; difficulty: number; correct: boolean }[];
  currentIndex: number;
}

const sessions = new Map<string, PlacementSession>();

export function startPlacement(userId: string): PlacementQuestion {
  sessions.set(userId, { answers: [], currentIndex: 0 });
  return PLACEMENT_QUESTIONS[0]!;
}

export type AnswerPlacementOutcome =
  | { done: false; nextQuestion: PlacementQuestion; progress: { current: number; total: number } }
  | { done: true; result: PlacementResult }
  | { done: "no-session" }
  | { done: "stale" };

/** `questionId` doit correspondre à la question actuellement attendue — protège contre un clic sur un vieux bouton après avoir déjà avancé. */
export async function answerPlacement(userId: string, questionId: number, choiceIndex: number): Promise<AnswerPlacementOutcome> {
  const session = sessions.get(userId);
  if (!session) return { done: "no-session" };

  const expected = PLACEMENT_QUESTIONS[session.currentIndex];
  if (!expected || expected.id !== questionId) return { done: "stale" };

  session.answers.push({
    category: expected.category,
    difficulty: expected.difficulty,
    correct: choiceIndex === expected.correctIndex,
  });
  session.currentIndex++;

  const next = PLACEMENT_QUESTIONS[session.currentIndex];
  if (!next) {
    const result = await computeResult(session.answers);
    sessions.delete(userId);
    return { done: true, result };
  }

  return { done: false, nextQuestion: next, progress: { current: session.currentIndex + 1, total: PLACEMENT_QUESTIONS.length } };
}

export interface PlacementResult {
  estimatedLevelOrder: number; // 1 à 5
  estimatedLevelName: string;
  scorePercent: number;
  weakestCategory: { category: SkillCategory; label: string; accuracyPercent: number } | null;
  suggestedCourse: { key: string; title: string } | null;
}

/**
 * Niveau estimé = le palier de difficulté (1, 3, 5 — les seuls présents
 * dans le banc de questions) le plus élevé où l'utilisateur maintient au
 * moins 60% de bonnes réponses TOUTES CATÉGORIES confondues à ce palier —
 * échouer largement les questions difficiles ne doit pas être compensé par
 * de bonnes réponses aux questions faciles dans l'estimation du niveau.
 */
function estimateLevelOrder(answers: PlacementSession["answers"]): number {
  const tiers = [5, 3, 1];
  for (const tier of tiers) {
    const atTier = answers.filter((a) => a.difficulty === tier);
    if (atTier.length === 0) continue;
    const correct = atTier.filter((a) => a.correct).length;
    if (correct / atTier.length >= 0.6) return tier;
  }
  return 1;
}

async function computeResult(answers: PlacementSession["answers"]): Promise<PlacementResult> {
  const totalCorrect = answers.filter((a) => a.correct).length;
  const scorePercent = Math.round((totalCorrect / answers.length) * 100);
  const estimatedLevelOrder = estimateLevelOrder(answers);

  const byCategory = new Map<SkillCategory, { correct: number; total: number }>();
  for (const a of answers) {
    const entry = byCategory.get(a.category) ?? { correct: 0, total: 0 };
    entry.total++;
    if (a.correct) entry.correct++;
    byCategory.set(a.category, entry);
  }

  let weakestCategory: PlacementResult["weakestCategory"] = null;
  let worstRatio = Infinity;
  for (const [category, { correct, total }] of byCategory) {
    const ratio = correct / total;
    if (ratio < worstRatio) {
      worstRatio = ratio;
      weakestCategory = { category, label: SKILL_CATEGORY_LABELS[category], accuracyPercent: Math.round(ratio * 100) };
    }
  }

  let suggestedCourse: PlacementResult["suggestedCourse"] = null;
  if (weakestCategory) {
    const courses = await listCourses();
    const inCategory = courses
      .filter((c) => c.category === weakestCategory!.category)
      .sort((a, b) => a.level - b.level);
    // Cours de départ : le plus accessible dans la catégorie la moins solide, pas forcément calé exactement sur le niveau estimé — mieux vaut asseoir les bases avant de viser plus haut dans une catégorie faible.
    const pick = inCategory[0];
    if (pick) suggestedCourse = { key: pick.key, title: pick.title };
  }

  return {
    estimatedLevelOrder,
    estimatedLevelName: labelForLevelOrder(estimatedLevelOrder),
    scorePercent,
    weakestCategory,
    suggestedCourse,
  };
}
