import {
  addSkillXp,
  advanceCourseProgress,
  completeCourseProgress,
  countLessonsForCourse,
  findCourseByKey,
  findLessonByCourseAndOrder,
  findLessonById,
  getCourseProgress,
  getOrCreateCourseProgress,
  listCourses,
  upsertLessonCompletion,
} from "../database/repositories/academyRepository.js";
import { unlockAchievement } from "../services/achievementService.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("academyService");

/** Score minimal (proportion de bonnes réponses) pour valider une leçon et avancer. */
const PASS_THRESHOLD = 0.5;

export interface CourseSummary {
  key: string;
  title: string;
  description: string;
  level: number;
  status: "not_started" | "in_progress" | "completed";
  currentLessonOrder: number;
  totalLessons: number;
}

export async function listCourseSummaries(userId: string): Promise<CourseSummary[]> {
  const courses = await listCourses();

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

/**
 * Démarre (ou reprend) un cours pour un utilisateur et retourne la leçon
 * courante à afficher, ou `null` si le cours est déjà entièrement terminé.
 */
export async function startOrResumeCourse(
  userId: string,
  courseKey: string,
): Promise<LessonView | null> {
  const course = await findCourseByKey(courseKey);
  if (!course) return null;

  const progress = await getOrCreateCourseProgress(userId, course.id);
  const totalLessons = await countLessonsForCourse(course.id);

  if (progress.status === "COMPLETED" || progress.currentLessonOrder > totalLessons) {
    return null;
  }

  const lesson = await findLessonByCourseAndOrder(course.id, progress.currentLessonOrder);
  if (!lesson) return null;

  return toLessonView(lesson, course.title, totalLessons);
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
      choices: JSON.parse(q.choices) as string[],
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

  const correct = choiceIndex === question.correctIndex;
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
            choices: JSON.parse(nextQuestionData.choices) as string[],
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
  achievementUnlocked: boolean;
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
    return { passed, score, totalQuestions, xpAwarded: 0, courseCompleted: false, achievementUnlocked: false };
  }

  const progress = await getOrCreateCourseProgress(userId, lesson.course.id);
  const isCurrentLesson = lesson.order === progress.currentLessonOrder;

  if (!isCurrentLesson) {
    // Leçon déjà validée précédemment, rejouée : score enregistré, pas d'XP en double.
    return { passed, score, totalQuestions, xpAwarded: 0, courseCompleted: false, achievementUnlocked: false };
  }

  await addSkillXp(userId, lesson.course.skillKey, lesson.xpReward);

  const totalLessons = await countLessonsForCourse(lesson.course.id);
  let courseCompleted = false;
  let achievementUnlocked = false;

  if (lesson.order >= totalLessons) {
    await completeCourseProgress(userId, lesson.course.id);
    achievementUnlocked = await unlockAchievement(userId, "first-course-complete");
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
    achievementUnlocked,
  };
}

export async function getLessonView(lessonId: string): Promise<LessonView | null> {
  const lesson = await findLessonById(lessonId);
  if (!lesson) return null;
  const totalLessons = await countLessonsForCourse(lesson.course.id);
  return toLessonView(lesson, lesson.course.title, totalLessons);
}
