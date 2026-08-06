import { listCourses } from "../database/repositories/academyRepository.js";
import { listCourseSummaries } from "../education/academyService.js";

export interface RoadmapCourse {
  key: string;
  title: string;
  category: string;
  level: number;
  status: "not_started" | "in_progress" | "completed";
  prerequisiteTitles: string[];
  locked: boolean; // prérequis non tous terminés
}

function parseKeys(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Vue d'ensemble de tous les cours avec leurs prérequis et le statut de
 * l'utilisateur sur chacun — pour visualiser l'ordre logique plutôt que de
 * le deviner (voir progression/roadmapView.ts pour le rendu).
 */
export async function getRoadmap(userId: string): Promise<RoadmapCourse[]> {
  const [rawCourses, summaries] = await Promise.all([listCourses(), listCourseSummaries(userId)]);

  const statusByKey = new Map(summaries.map((s) => [s.key, s.status]));
  const titleByKey = new Map(rawCourses.map((c) => [c.key, c.title]));

  return rawCourses
    .map((course) => {
      const prereqKeys = parseKeys(course.prerequisiteCourseKeys);
      const locked = prereqKeys.some((k) => statusByKey.get(k) !== "completed");

      return {
        key: course.key,
        title: course.title,
        category: course.category,
        level: course.level,
        status: statusByKey.get(course.key) ?? "not_started",
        prerequisiteTitles: prereqKeys.map((k) => titleByKey.get(k) ?? k),
        locked: locked && prereqKeys.length > 0,
      };
    })
    .sort((a, b) => a.category.localeCompare(b.category) || a.level - b.level);
}
