import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import type { ExerciseDetail, ExerciseSubmissionResult, ExerciseSummary } from "./exerciseService.js";
import type { UnlockedAchievementInfo } from "../services/achievementService.js";
import { labelForLevelOrder } from "../utils/leveling.js";
import {
  baseContainer,
  containerPayload,
  ephemeralContainerPayload,
  fieldText,
  textDisplay,
  thinSeparator,
  type ContainerPayload,
  type EphemeralContainerPayload,
} from "../ui/container.js";

export const EXERCISE_SUBMIT_MODAL_ID = "exercise:submit_modal";
export const EXERCISE_ANSWER_INPUT_ID = "answer";

const COLOR_ORANGE = 0xe67e22;
const COLOR_GREEN = 0x57f287;
const COLOR_RED = 0xed4245;

const TYPE_LABELS: Record<string, string> = {
  MCQ: "QCM",
  TEXT: "Debug / Trouve le bug / Complète le code",
};

function answerButtonCustomId(key: string, index: number): string {
  return `exercise:answer:${key}:${index}`;
}

function submitButtonCustomId(key: string): string {
  return `exercise:submit:${key}`;
}

/** Parse "exercise:answer:<key>:<index>" → { key, index }, pour les boutons de réponse QCM. */
export function parseExerciseAnswerButtonId(customId: string): { key: string; index: number } | null {
  if (!customId.startsWith("exercise:answer:")) return null;
  const rest = customId.slice("exercise:answer:".length);
  const lastColon = rest.lastIndexOf(":");
  if (lastColon === -1) return null;
  const key = rest.slice(0, lastColon);
  const index = Number(rest.slice(lastColon + 1));
  if (!key || Number.isNaN(index)) return null;
  return { key, index };
}

/** Parse "exercise:submit:<key>" → key, pour le bouton qui ouvre le Modal de soumission (type TEXT). */
export function parseExerciseSubmitButtonId(customId: string): string | null {
  if (!customId.startsWith("exercise:submit:")) return null;
  return customId.slice("exercise:submit:".length);
}

export function buildExerciseListReply(exercises: ExerciseSummary[]): ContainerPayload {
  const container = baseContainer("🏋️ Exercices pratiques Nodify", COLOR_ORANGE).addTextDisplayComponents(
    textDisplay(
      exercises.length > 0
        ? "QCM et défis de code courts, rejouables à volonté — utilise `/exercise practice` pour t'entraîner sur l'un d'eux."
        : "Aucun exercice disponible pour l'instant.",
    ),
  );

  if (exercises.length > 0) {
    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(
      textDisplay(
        exercises
          .map((e) =>
            fieldText(
              `${e.solved ? "✅" : "🔲"} ${e.title}`,
              `${TYPE_LABELS[e.type] ?? e.type} · ${e.category} · Difficulté : ${labelForLevelOrder(e.difficulty)} · Clé : \`${e.key}\``,
            ),
          )
          .join("\n\n"),
      ),
    );
  }

  return containerPayload(container);
}

export function buildExercisePracticeReply(exercise: ExerciseDetail): ContainerPayload {
  const container = baseContainer(`🏋️ ${exercise.title}`, COLOR_ORANGE).addTextDisplayComponents(
    textDisplay(exercise.prompt),
    textDisplay(
      fieldText(
        "Détails",
        `${TYPE_LABELS[exercise.type] ?? exercise.type} · ${exercise.category} · Difficulté : ${labelForLevelOrder(exercise.difficulty)}`,
      ),
    ),
  );

  if (exercise.solved) {
    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(textDisplay("-# Déjà résolu — tu peux le refaire pour t'entraîner, sans XP/crédits supplémentaires."));
  }

  if (exercise.type === "MCQ" && exercise.choices) {
    const letters = ["A", "B", "C", "D"];
    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        exercise.choices.map((choice, index) =>
          new ButtonBuilder()
            .setCustomId(answerButtonCustomId(exercise.key, index))
            .setLabel(`${letters[index]}. ${choice}`.slice(0, 80))
            .setStyle(ButtonStyle.Secondary),
        ),
      ),
    );
  } else if (exercise.type === "TEXT") {
    container.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(submitButtonCustomId(exercise.key)).setLabel("✍️ Soumettre une réponse").setStyle(ButtonStyle.Primary),
      ),
    );
  }

  return containerPayload(container);
}

export function buildExerciseSubmitModal(exerciseKey: string): ModalBuilder {
  const input = new TextInputBuilder()
    .setCustomId(EXERCISE_ANSWER_INPUT_ID)
    .setLabel("Ta réponse")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(200);

  return new ModalBuilder()
    .setCustomId(`${EXERCISE_SUBMIT_MODAL_ID}:${exerciseKey}`)
    .setTitle("Soumettre une réponse")
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
}

function unlockedAchievementsText(unlocked: UnlockedAchievementInfo[]): string {
  return unlocked.map((a) => `\n🏆 Succès débloqué : **${a.icon} ${a.name}**`).join("");
}

export function buildExerciseResultReply(result: ExerciseSubmissionResult): EphemeralContainerPayload {
  const title = result.correct ? "✅ Bonne réponse !" : "❌ Pas tout à fait";
  const color = result.correct ? COLOR_GREEN : COLOR_RED;

  const lines = [result.explanation];
  if (result.correct && result.alreadySolvedBefore) {
    lines.push("-# Déjà résolu précédemment — pas d'XP/crédits supplémentaires, mais bien joué pour l'entraînement !");
  } else if (result.correct) {
    lines.push(`-# +${result.xpAwarded > 0 ? `${result.xpAwarded} XP, ` : ""}crédits gagnés.` + unlockedAchievementsText(result.unlockedAchievements));
  }

  const container = baseContainer(title, color).addTextDisplayComponents(textDisplay(lines.join("\n")));

  return ephemeralContainerPayload(container);
}
