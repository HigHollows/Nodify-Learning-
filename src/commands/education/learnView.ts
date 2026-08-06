import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type {
  AnswerResult,
  CourseSummary,
  LessonFinishResult,
  LessonView,
} from "../../education/academyService.js";
import { labelForLevelOrder } from "../../utils/leveling.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../../ui/container.js";
import { buildShareCourseButton } from "../../social/shareView.js";

export const ACADEMY_LIST_BUTTON_ID = "academy:list";

const COLOR_ORANGE = 0xe67e22;
const COLOR_BLUE = 0x3498db;
const COLOR_GREEN = 0x57f287;
const COLOR_RED = 0xed4245;

export function buildPrerequisitesBlockedReply(missingPrerequisites: string[]): ContainerPayload {
  const container = baseContainer("🔒 Prérequis manquant", COLOR_ORANGE).addTextDisplayComponents(
    textDisplay(
      "Termine d'abord ce(s) cours avant de pouvoir commencer celui-ci :\n" +
        missingPrerequisites.map((title) => `• **${title}**`).join("\n"),
    ),
  );

  return containerPayload(container);
}

const STATUS_LABEL: Record<CourseSummary["status"], string> = {
  not_started: "⚪ Pas commencé",
  in_progress: "🟡 En cours",
  completed: "✅ Terminé",
};

export function buildCourseListReply(courses: CourseSummary[]): ContainerPayload {
  const container = baseContainer("🎓 Nodify Academy", COLOR_BLUE).addTextDisplayComponents(
    textDisplay(
      courses.length > 0 ? "Choisis un cours pour commencer ou continuer ta progression." : "Aucun cours disponible pour l'instant.",
    ),
  );

  if (courses.length > 0) {
    container.addTextDisplayComponents(
      textDisplay(
        courses
          .map((c) => {
            const status =
              `${STATUS_LABEL[c.status]}` + (c.status === "in_progress" ? ` (leçon ${c.currentLessonOrder}/${c.totalLessons})` : "");
            return `**${c.title} — ${labelForLevelOrder(c.level)}**\n${c.description}\n${status}`;
          })
          .join("\n\n"),
      ),
    );

    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        courses.slice(0, 5).map((c) =>
          new ButtonBuilder()
            .setCustomId(`academy:start:${c.key}`)
            .setLabel(c.status === "not_started" ? `▶️ ${c.title}` : `↪️ ${c.title}`)
            .setStyle(c.status === "completed" ? ButtonStyle.Secondary : ButtonStyle.Primary),
        ),
      ),
    );
  }

  return containerPayload(container);
}

export function buildLessonContentReply(lesson: LessonView): ContainerPayload {
  const container = baseContainer(`📘 ${lesson.title}`, COLOR_BLUE).addTextDisplayComponents(
    textDisplay(lesson.content),
    textDisplay(`-# ${lesson.courseTitle} — Leçon ${lesson.order}/${lesson.totalLessons}`),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`academy:begin-quiz:${lesson.lessonId}`).setLabel("📝 Commencer le quiz").setStyle(ButtonStyle.Primary),
    ),
  );

  return containerPayload(container);
}

const CHOICE_LETTERS = ["A", "B", "C", "D", "E"];

export function buildQuestionReply(
  lessonId: string,
  question: { order: number; prompt: string; choices: string[] },
  totalQuestions: number,
  runningCorrect: number,
): ContainerPayload {
  const container = baseContainer(`❓ Question ${question.order}/${totalQuestions}`, COLOR_BLUE).addTextDisplayComponents(
    textDisplay(question.prompt),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      question.choices.map((choice, index) =>
        new ButtonBuilder()
          .setCustomId(`academy:answer:${lessonId}:${question.order}:${runningCorrect}:${index}`)
          .setLabel(`${CHOICE_LETTERS[index]}. ${choice}`.slice(0, 80))
          .setStyle(ButtonStyle.Secondary),
      ),
    ),
  );

  return containerPayload(container);
}

export function buildAnswerFeedbackReply(lessonId: string, result: AnswerResult): ContainerPayload {
  const container = baseContainer(
    result.correct ? "✅ Bonne réponse !" : "❌ Pas tout à fait",
    result.correct ? COLOR_GREEN : COLOR_RED,
  ).addTextDisplayComponents(textDisplay(result.explanation));

  const button = result.isLastQuestion
    ? new ButtonBuilder()
        .setCustomId(`academy:finish:${lessonId}:${result.updatedRunningCorrect}:${result.totalQuestions}`)
        .setLabel("🏁 Terminer la leçon")
        .setStyle(ButtonStyle.Primary)
    : new ButtonBuilder()
        .setCustomId(`academy:next-question:${lessonId}:${result.nextQuestion?.order ?? 1}:${result.updatedRunningCorrect}`)
        .setLabel("➡️ Question suivante")
        .setStyle(ButtonStyle.Primary);

  container.addActionRowComponents(new ActionRowBuilder<ButtonBuilder>().addComponents(button));

  return containerPayload(container);
}

export function buildLessonFinishReply(courseKey: string, lessonId: string, result: LessonFinishResult): ContainerPayload {
  if (!result.passed) {
    const container = baseContainer("📉 Pas encore validé", COLOR_ORANGE).addTextDisplayComponents(
      textDisplay(
        `Score : **${result.score}/${result.totalQuestions}** — il faut au moins 50% de bonnes réponses pour valider cette leçon.`,
      ),
    );

    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`academy:restart:${lessonId}`).setLabel("🔁 Recommencer la leçon").setStyle(ButtonStyle.Primary),
      ),
    );

    return containerPayload(container);
  }

  const container = baseContainer(
    result.courseCompleted ? "🎉 Cours terminé !" : "🎉 Leçon terminée !",
    COLOR_GREEN,
  ).addTextDisplayComponents(
    textDisplay(
      `Score : **${result.score}/${result.totalQuestions}** — +${result.xpAwarded} XP` +
        result.unlockedAchievements.map((a) => `\n🏆 Succès débloqué : **${a.icon} ${a.name}**`).join(""),
    ),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      result.courseCompleted
        ? [
            new ButtonBuilder().setCustomId(ACADEMY_LIST_BUTTON_ID).setLabel("📚 Voir les cours").setStyle(ButtonStyle.Secondary),
            buildShareCourseButton(courseKey),
          ]
        : [new ButtonBuilder().setCustomId(`academy:start:${courseKey}`).setLabel("➡️ Leçon suivante").setStyle(ButtonStyle.Primary)],
    ),
  );

  return containerPayload(container);
}
