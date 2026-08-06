import {
  addSkillXp,
  advanceCourseProgress,
  completeCourseProgress,
  countLessonsForCourse,
  findCourseByKey,
  findCoursesByKeys,
  findLessonByCourseAndOrder,
  findLessonById,
  getCourseProgress,
  getOrCreateCourseProgress,
  listCompletedCourses,
  listCourses,
  upsertLessonCompletion,
} from "../database/repositories/academyRepository.js";
import { awardCourseCompleted, awardLessonPassed } from "../credits/rewardService.js";
import { unlockAchievementWithInfo, type UnlockedAchievementInfo } from "../services/achievementService.js";
import { childLogger } from "../utils/logger.js";
import { shuffleChoices } from "../utils/quizShuffle.js";

const log = childLogger("academyService");

/**
 * Badges "développeur"/"cyber"/"IA" (voir prisma/seed.ts ACHIEVEMENTS) —
 * débloqués sur des jalons de cours terminés, évalués à chaque complétion
 * de cours plutôt que suivis dans un champ séparé (la vérité reste
 * `UserCourseProgress`, pas un compteur qui pourrait se désynchroniser).
 */
const SINGLE_COURSE_BADGES: Record<string, string> = {
  "web-vulnerabilities-owasp": "web-security-aware",
  "osint-social-engineering": "osint-investigator",
  "ai-fundamentals": "ai-explorer",
  "prompt-engineering": "prompt-master",
};
const JS_ADEPT_THRESHOLD = 3;

/** Évalue les badges de progression débloqués par la complétion d'un cours donné, en plus de "first-course-complete" (géré séparément). */
async function evaluateCourseBadges(userId: string, completedCourseKey: string): Promise<UnlockedAchievementInfo[]> {
  const unlocked: UnlockedAchievementInfo[] = [];
  const completed = await listCompletedCourses(userId);
  const completedKeys = new Set(completed.map((c) => c.key));
  const skillKeyCounts = new Map<string, number>();
  for (const c of completed) {
    skillKeyCounts.set(c.skillKey, (skillKeyCounts.get(c.skillKey) ?? 0) + 1);
  }

  const directBadgeKey = SINGLE_COURSE_BADGES[completedCourseKey];
  if (directBadgeKey) {
    const info = await unlockAchievementWithInfo(userId, directBadgeKey);
    if (info) unlocked.push(info);
  }

  if ((skillKeyCounts.get("javascript") ?? 0) >= JS_ADEPT_THRESHOLD) {
    const info = await unlockAchievementWithInfo(userId, "js-adept");
    if (info) unlocked.push(info);
  }

  if (skillKeyCounts.has("javascript") && skillKeyCounts.has("typescript") && skillKeyCounts.has("python")) {
    const info = await unlockAchievementWithInfo(userId, "polyglot-developer");
    if (info) unlocked.push(info);
  }

  if (completedKeys.has("backend-rest-auth") && completedKeys.has("databases-sql-orm")) {
    const info = await unlockAchievementWithInfo(userId, "backend-architect");
    if (info) unlocked.push(info);
  }

  return unlocked;
}

/** Score minimal (proportion de bonnes réponses) pour valider une leçon et avancer. */
const PASS_THRESHOLD = 0.5;

export interface CourseSummary {
  key: string;
  title: string;
  description: string;
  category: string;
  level: number;
  status: "not_started" | "in_progress" | "completed";
  currentLessonOrder: number;
  totalLessons: number;
}

export async function listCourseSummaries(
  userId: string,
  categoryFilter?: string,
): Promise<CourseSummary[]> {
  const allCourses = await listCourses();
  const courses = categoryFilter
    ? allCourses.filter((c) => c.category === categoryFilter)
    : allCourses;

  return Promise.all(
    courses.map(async (course) => {
      const [progress, totalLessons] = await Promise.all([
        getCourseProgress(userId, course.id),
        countLessonsForCourse(course.id),
      ]);

      return {
        key: course.key,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        status: !progress
          ? "not_started"
          : progress.status === "COMPLETED"
            ? "completed"
            : "in_progress",
        currentLessonOrder: progress?.currentLessonOrder ?? 1,
        totalLessons,
      };
    }),
  );
}

export interface LessonView {
  lessonId: string;
  courseKey: string;
  courseTitle: string;
  order: number;
  totalLessons: number;
  title: string;
  content: string;
  questions: { order: number; prompt: string; choices: string[] }[];
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
 * Titres des cours prérequis pas encore terminés par l'utilisateur — vide
 * si tous sont satisfaits (ou si le cours n'a aucun prérequis).
 */
async function getMissingPrerequisites(
  userId: string,
  course: { prerequisiteCourseKeys: string },
): Promise<string[]> {
  const prereqKeys = parseKeys(course.prerequisiteCourseKeys);
  if (prereqKeys.length === 0) return [];

  const prereqCourses = await findCoursesByKeys(prereqKeys);
  const missing: string[] = [];

  for (const prereq of prereqCourses) {
    const progress = await getCourseProgress(userId, prereq.id);
    if (progress?.status !== "COMPLETED") missing.push(prereq.title);
  }

  return missing;
}

export type StartCourseResult =
  | { type: "not_found" }
  | { type: "blocked"; missingPrerequisites: string[] }
  | { type: "lesson"; lesson: LessonView };

/**
 * Démarre (ou reprend) un cours pour un utilisateur. Renvoie `blocked` si
 * un prérequis (Course.prerequisiteCourseKeys) n'est pas encore terminé —
 * appliqué ici pour la première fois : le champ existait depuis la Phase 5
 * mais n'était encore vérifié nulle part.
 */
export async function startOrResumeCourse(
  userId: string,
  courseKey: string,
): Promise<StartCourseResult> {
  const course = await findCourseByKey(courseKey);
  if (!course) return { type: "not_found" };

  const missingPrerequisites = await getMissingPrerequisites(userId, course);
  if (missingPrerequisites.length > 0) {
    return { type: "blocked", missingPrerequisites };
  }

  const progress = await getOrCreateCourseProgress(userId, course.id);
  const totalLessons = await countLessonsForCourse(course.id);

  if (progress.status === "COMPLETED" || progress.currentLessonOrder > totalLessons) {
    return { type: "not_found" };
  }

  const lesson = await findLessonByCourseAndOrder(course.id, progress.currentLessonOrder);
  if (!lesson) return { type: "not_found" };

  return { type: "lesson", lesson: toLessonView(lesson, course.title, totalLessons) };
}

/** Clé stable pour le mélange des choix — même leçon + même ordre de question → même mélange à l'affichage et à la correction. */
function questionSeed(lessonId: string, order: number): string {
  return `${lessonId}:${order}`;
}

function toLessonView(
  lesson: NonNullable<Awaited<ReturnType<typeof findLessonById>>>,
  courseTitle: string,
  totalLessons: number,
): LessonView {
  return {
    lessonId: lesson.id,
    courseKey: lesson.course.key,
    courseTitle,
    order: lesson.order,
    totalLessons,
    title: lesson.title,
    content: lesson.content,
    questions: lesson.questions.map((q) => ({
      order: q.order,
      prompt: q.prompt,
      choices: shuffleChoices(questionSeed(lesson.id, q.order), JSON.parse(q.choices) as string[], q.correctIndex).choices,
    })),
  };
}

export interface AnswerResult {
  correct: boolean;
  explanation: string;
  isLastQuestion: boolean;
  updatedRunningCorrect: number;
  totalQuestions: number;
  nextQuestion?: { order: number; prompt: string; choices: string[] };
}

/** Évalue la réponse à une question précise d'une leçon, sans faire avancer la progression. */
export async function evaluateAnswer(
  lessonId: string,
  questionOrder: number,
  choiceIndex: number,
  runningCorrect: number,
): Promise<AnswerResult | null> {
  const lesson = await findLessonById(lessonId);
  if (!lesson) return null;

  const question = lesson.questions.find((q) => q.order === questionOrder);
  if (!question) return null;

  // La leçon est re-fetch ici, séparément de l'affichage — on recalcule le
  // même mélange (même clé) pour comparer au bon index.
  const { correctIndex } = shuffleChoices(
    questionSeed(lessonId, question.order),
    JSON.parse(question.choices) as string[],
    question.correctIndex,
  );
  const correct = choiceIndex === correctIndex;
  const updatedRunningCorrect = runningCorrect + (correct ? 1 : 0);
  const totalQuestions = lesson.questions.length;
  const isLastQuestion = questionOrder >= totalQuestions;

  const nextQuestionData = isLastQuestion
    ? undefined
    : lesson.questions.find((q) => q.order === questionOrder + 1);

  return {
    correct,
    explanation: question.explanation,
    isLastQuestion,
    updatedRunningCorrect,
    totalQuestions,
    ...(nextQuestionData
      ? {
          nextQuestion: {
            order: nextQuestionData.order,
            prompt: nextQuestionData.prompt,
            choices: shuffleChoices(
              questionSeed(lessonId, nextQuestionData.order),
              JSON.parse(nextQuestionData.choices) as string[],
              nextQuestionData.correctIndex,
            ).choices,
          },
        }
      : {}),
  };
}

export interface LessonFinishResult {
  passed: boolean;
  score: number;
  totalQuestions: number;
  xpAwarded: number;
  courseCompleted: boolean;
  unlockedAchievements: UnlockedAchievementInfo[];
}

/**
 * Finalise une leçon : enregistre le score, et si réussie (>= seuil), avance
 * la progression + crédite l'XP — mais SEULEMENT si c'est la leçon "courante"
 * du parcours (rejouer une leçon déjà validée ne permet pas de refarmer l'XP).
 */
export async function finishLesson(
  userId: string,
  lessonId: string,
  score: number,
  totalQuestions: number,
): Promise<LessonFinishResult | null> {
  const lesson = await findLessonById(lessonId);
  if (!lesson) return null;

  const passed = totalQuestions > 0 && score / totalQuestions >= PASS_THRESHOLD;
  await upsertLessonCompletion(userId, lessonId, { score, totalQuestions, passed });

  if (!passed) {
    return { passed, score, totalQuestions, xpAwarded: 0, courseCompleted: false, unlockedAchievements: [] };
  }

  const progress = await getOrCreateCourseProgress(userId, lesson.course.id);
  const isCurrentLesson = lesson.order === progress.currentLessonOrder;

  if (!isCurrentLesson) {
    // Leçon déjà validée précédemment, rejouée : score enregistré, pas d'XP en double.
    return { passed, score, totalQuestions, xpAwarded: 0, courseCompleted: false, unlockedAchievements: [] };
  }

  await addSkillXp(userId, lesson.course.skillKey, lesson.xpReward);
  await awardLessonPassed(userId); // Learning Reward — quiz réussi (+5 crédits, voir rewardService.ts)

  const totalLessons = await countLessonsForCourse(lesson.course.id);
  let courseCompleted = false;
  const unlockedAchievements: UnlockedAchievementInfo[] = [];

  if (lesson.order >= totalLessons) {
    await completeCourseProgress(userId, lesson.course.id);
    const firstCourseInfo = await unlockAchievementWithInfo(userId, "first-course-complete");
    if (firstCourseInfo) unlockedAchievements.push(firstCourseInfo);
    unlockedAchievements.push(...(await evaluateCourseBadges(userId, lesson.course.key)));
    await awardCourseCompleted(userId); // Learning Reward — cours terminé (+10 crédits)
    courseCompleted = true;
  } else {
    await advanceCourseProgress(userId, lesson.course.id, lesson.order + 1);
  }

  log.info(
    { userId, lessonId, score, totalQuestions, courseCompleted },
    "Leçon terminée et validée",
  );

  return {
    passed,
    score,
    totalQuestions,
    xpAwarded: lesson.xpReward,
    courseCompleted,
    unlockedAchievements,
  };
}

export async function getLessonView(lessonId: string): Promise<LessonView | null> {
  const lesson = await findLessonById(lessonId);
  if (!lesson) return null;
  const totalLessons = await countLessonsForCourse(lesson.course.id);
  return toLessonView(lesson, lesson.course.title, totalLessons);
}
