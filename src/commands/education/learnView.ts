import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import type {
  AnswerResult,
  CourseSummary,
  LessonFinishResult,
  LessonView,
} from "../../education/academyService.js";
import { labelForLevelOrder } from "../../utils/leveling.js";

export const ACADEMY_LIST_BUTTON_ID = "academy:list";

const STATUS_LABEL: Record<CourseSummary["status"], string> = {
  not_started: "⚪ Pas commencé",
  in_progress: "🟡 En cours",
  completed: "✅ Terminé",
};

export function buildCourseListReply(courses: CourseSummary[]) {
  const embed = new EmbedBuilder()
    .setTitle("🎓 Nodify Academy")
    .setColor("Blue")
    .setDescription(
      courses.length > 0
        ? "Choisis un cours pour commencer ou continuer ta progression."
        : "Aucun cours disponible pour l'instant.",
    )
    .addFields(
      courses.map((c) => ({
        name: `${c.title} — ${labelForLevelOrder(c.level)}`,
        value:
          `${c.description}\n${STATUS_LABEL[c.status]}` +
          (c.status === "in_progress"
            ? ` (leçon ${c.currentLessonOrder}/${c.totalLessons})`
            : ""),
      })),
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    courses.slice(0, 5).map((c) =>
      new ButtonBuilder()
        .setCustomId(`academy:start:${c.key}`)
        .setLabel(c.status === "not_started" ? `▶️ ${c.title}` : `↪️ ${c.title}`)
        .setStyle(c.status === "completed" ? ButtonStyle.Secondary : ButtonStyle.Primary),
    ),
  );

  return { embeds: [embed], components: courses.length > 0 ? [row] : [] };
}

export function buildLessonContentReply(lesson: LessonView) {
  const embed = new EmbedBuilder()
    .setTitle(`📘 ${lesson.title}`)
    .setColor("Blue")
    .setDescription(lesson.content)
    .setFooter({ text: `${lesson.courseTitle} — Leçon ${lesson.order}/${lesson.totalLessons}` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`academy:begin-quiz:${lesson.lessonId}`)
      .setLabel("📝 Commencer le quiz")
      .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
}

const CHOICE_LETTERS = ["A", "B", "C", "D", "E"];

export function buildQuestionReply(
  lessonId: string,
  question: { order: number; prompt: string; choices: string[] },
  totalQuestions: number,
  runningCorrect: number,
) {
  const embed = new EmbedBuilder()
    .setTitle(`❓ Question ${question.order}/${totalQuestions}`)
    .setColor("Blue")
    .setDescription(question.prompt);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    question.choices.map((choice, index) =>
      new ButtonBuilder()
        .setCustomId(`academy:answer:${lessonId}:${question.order}:${runningCorrect}:${index}`)
        .setLabel(`${CHOICE_LETTERS[index]}. ${choice}`.slice(0, 80))
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return { embeds: [embed], components: [row] };
}

export function buildAnswerFeedbackReply(lessonId: string, result: AnswerResult) {
  const embed = new EmbedBuilder()
    .setTitle(result.correct ? "✅ Bonne réponse !" : "❌ Pas tout à fait")
    .setColor(result.correct ? "Green" : "Red")
    .setDescription(result.explanation);

  const button = result.isLastQuestion
    ? new ButtonBuilder()
        .setCustomId(`academy:finish:${lessonId}:${result.updatedRunningCorrect}:${result.totalQuestions}`)
        .setLabel("🏁 Terminer la leçon")
        .setStyle(ButtonStyle.Primary)
    : new ButtonBuilder()
        .setCustomId(
          `academy:next-question:${lessonId}:${(result.nextQuestion?.order ?? 1)}:${result.updatedRunningCorrect}`,
        )
        .setLabel("➡️ Question suivante")
        .setStyle(ButtonStyle.Primary);

  return { embeds: [embed], components: [new ActionRowBuilder<ButtonBuilder>().addComponents(button)] };
}

export function buildLessonFinishReply(
  courseKey: string,
  lessonId: string,
  result: LessonFinishResult,
) {
  if (!result.passed) {
    const embed = new EmbedBuilder()
      .setTitle("📉 Pas encore validé")
      .setColor("Orange")
      .setDescription(
        `Score : **${result.score}/${result.totalQuestions}** — il faut au moins 50% de bonnes réponses pour valider cette leçon.`,
      );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`academy:restart:${lessonId}`)
        .setLabel("🔁 Recommencer la leçon")
        .setStyle(ButtonStyle.Primary),
    );

    return { embeds: [embed], components: [row] };
  }

  const embed = new EmbedBuilder()
    .setTitle(result.courseCompleted ? "🎉 Cours terminé !" : "🎉 Leçon terminée !")
    .setColor("Green")
    .setDescription(
      `Score : **${result.score}/${result.totalQuestions}** — +${result.xpAwarded} XP` +
        (result.achievementUnlocked ? "\n🏆 Succès débloqué : **Premier cours terminé**" : ""),
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    result.courseCompleted
      ? new ButtonBuilder()
          .setCustomId(ACADEMY_LIST_BUTTON_ID)
          .setLabel("📚 Voir les cours")
          .setStyle(ButtonStyle.Secondary)
      : new ButtonBuilder()
          .setCustomId(`academy:start:${courseKey}`)
          .setLabel("➡️ Leçon suivante")
          .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
}
