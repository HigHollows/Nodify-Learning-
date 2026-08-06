import { listCourses } from "../database/repositories/academyRepository.js";
import { listConceptsForSearch } from "../database/repositories/conceptRepository.js";
import {
  getDailyAnswerCorrectCountByCategory,
  getDailyAnswerStatsByCategory,
  listLessonScoresWithCourseCategory,
} from "../database/repositories/userRepository.js";

/** En dessous de ce nombre de questions cumulées dans une catégorie, l'échantillon est trop petit pour être fiable. */
const MIN_SAMPLE_SIZE = 3;

export interface WeakSpot {
  category: string;
  accuracyPercent: number;
  sampleSize: number;
  suggestedCourseKey: string | null;
  suggestedConceptKey: string | null;
}

/**
 * Combine les réponses à la question du jour (par catégorie, dénormalisée
 * à la réponse — voir dailyQuestionService.ts) et les scores de quiz
 * Academy (par catégorie de cours) pour repérer la catégorie où
 * l'utilisateur se trompe le plus, avec un échantillon assez grand pour
 * être significatif. `null` si aucune catégorie n'a assez de données.
 */
export async function getWeakestCategory(userId: string): Promise<WeakSpot | null> {
  const [totalsByCategory, correctByCategory, lessonScores] = await Promise.all([
    getDailyAnswerStatsByCategory(userId),
    getDailyAnswerCorrectCountByCategory(userId),
    listLessonScoresWithCourseCategory(userId),
  ]);

  const correct = new Map<string, number>();
  for (const row of correctByCategory) {
    if (row.category) correct.set(row.category, row._count._all);
  }

  const totals = new Map<string, number>();
  const gotRight = new Map<string, number>();

  for (const row of totalsByCategory) {
    if (!row.category) continue;
    totals.set(row.category, (totals.get(row.category) ?? 0) + row._count._all);
    gotRight.set(row.category, (gotRight.get(row.category) ?? 0) + (correct.get(row.category) ?? 0));
  }

  for (const row of lessonScores) {
    const category = row.lesson.course.category;
    totals.set(category, (totals.get(category) ?? 0) + row.totalQuestions);
    gotRight.set(category, (gotRight.get(category) ?? 0) + row.score);
  }

  let worst: { category: string; accuracy: number; sampleSize: number } | null = null;
  for (const [category, sampleSize] of totals) {
    if (sampleSize < MIN_SAMPLE_SIZE) continue;
    const accuracy = (gotRight.get(category) ?? 0) / sampleSize;
    if (!worst || accuracy < worst.accuracy) {
      worst = { category, accuracy, sampleSize };
    }
  }

  if (!worst) return null;

  const [courses, concepts] = await Promise.all([listCourses(), listConceptsForSearch()]);
  const suggestedCourse = courses.filter((c) => c.category === worst!.category).sort((a, b) => a.level - b.level)[0];
  const suggestedConcept = concepts.find((c) => c.category === worst!.category);

  return {
    category: worst.category,
    accuracyPercent: Math.round(worst.accuracy * 100),
    sampleSize: worst.sampleSize,
    suggestedCourseKey: suggestedCourse?.key ?? null,
    suggestedConceptKey: suggestedConcept?.key ?? null,
  };
}
