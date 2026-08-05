import type { ButtonInteraction } from "discord.js";
import {
  evaluateAnswer,
  finishLesson,
  getLessonView,
  listCourseSummaries,
  startOrResumeCourse,
} from "../education/academyService.js";
import {
  buildAnswerFeedbackReply,
  buildCourseListReply,
  buildLessonContentReply,
  buildLessonFinishReply,
  buildPrerequisitesBlockedReply,
  buildQuestionReply,
} from "../commands/education/learnView.js";
import { syncUserRolesForGuild } from "../setup/roleSyncService.js";
import { AppError } from "../utils/errors.js";

/**
 * L'état de la tentative en cours (question courante, score accumulé) est
 * encodé directement dans le customId des boutons plutôt que stocké en base
 * — pas besoin d'une table de "session de quiz" éphémère pour un parcours
 * strictement séquentiel.
 */

export async function handleListButton(interaction: ButtonInteraction): Promise<void> {
  const courses = await listCourseSummaries(interaction.user.id);
  await interaction.update(buildCourseListReply(courses));
}

export async function handleStartCourse(interaction: ButtonInteraction, courseKey: string): Promise<void> {
  const result = await startOrResumeCourse(interaction.user.id, courseKey);

  if (result.type === "not_found") {
    throw new AppError("Ce cours est introuvable ou déjà entièrement terminé.");
  }

  if (result.type === "blocked") {
    await interaction.update(buildPrerequisitesBlockedReply(result.missingPrerequisites));
    return;
  }

  await interaction.update(buildLessonContentReply(result.lesson));
}

export async function handleBeginQuiz(interaction: ButtonInteraction, lessonId: string): Promise<void> {
  const lesson = await getLessonView(lessonId);
  if (!lesson || lesson.questions.length === 0) {
    throw new AppError("Cette leçon n'a pas (ou plus) de quiz associé.");
  }
  const firstQuestion = lesson.questions[0]!;
  await interaction.update(buildQuestionReply(lessonId, firstQuestion, lesson.questions.length, 0));
}

export async function handleNextQuestion(
  interaction: ButtonInteraction,
  lessonId: string,
  questionOrder: number,
  runningCorrect: number,
): Promise<void> {
  const lesson = await getLessonView(lessonId);
  const question = lesson?.questions.find((q) => q.order === questionOrder);
  if (!lesson || !question) {
    throw new AppError("Cette question n'existe plus.");
  }
  await interaction.update(
    buildQuestionReply(lessonId, question, lesson.questions.length, runningCorrect),
  );
}

export async function handleAnswer(
  interaction: ButtonInteraction,
  lessonId: string,
  questionOrder: number,
  runningCorrect: number,
  choiceIndex: number,
): Promise<void> {
  const result = await evaluateAnswer(lessonId, questionOrder, choiceIndex, runningCorrect);
  if (!result) {
    throw new AppError("Cette question n'existe plus.");
  }
  await interaction.update(buildAnswerFeedbackReply(lessonId, result));
}

export async function handleFinishLesson(
  interaction: ButtonInteraction,
  lessonId: string,
  score: number,
  totalQuestions: number,
): Promise<void> {
  const lesson = await getLessonView(lessonId);
  if (!lesson) {
    throw new AppError("Cette leçon n'existe plus.");
  }

  const result = await finishLesson(interaction.user.id, lessonId, score, totalQuestions);
  if (!result) {
    throw new AppError("Cette leçon n'existe plus.");
  }

  await interaction.update(buildLessonFinishReply(lesson.courseKey, lessonId, result));

  // En arrière-plan, après la réponse : ne doit jamais retarder ni casser l'UX de la leçon.
  if (result.xpAwarded > 0 && interaction.inCachedGuild()) {
    void syncUserRolesForGuild(interaction.guild, interaction.user.id);
  }
}

export async function handleRestartLesson(interaction: ButtonInteraction, lessonId: string): Promise<void> {
  const lesson = await getLessonView(lessonId);
  if (!lesson) {
    throw new AppError("Cette leçon n'existe plus.");
  }
  await interaction.update(buildLessonContentReply(lesson));
}
