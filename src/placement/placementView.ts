import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type ContainerBuilder } from "discord.js";
import type { PlacementQuestion } from "./placementQuestions.js";
import type { PlacementResult } from "./placementService.js";
import {
  baseContainer,
  ephemeralContainerPayload,
  messageViewPayload,
  textDisplay,
  type EphemeralContainerPayload,
  type MessageViewPayload,
} from "../ui/container.js";

const COLOR_TEAL = 0x1abc9c;
const CHOICE_LETTERS = ["A", "B", "C", "D"];

function answerButtonId(questionId: number, index: number): string {
  return `placement:answer:${questionId}:${index}`;
}

export function parsePlacementAnswerButtonId(customId: string): { questionId: number; index: number } | null {
  if (!customId.startsWith("placement:answer:")) return null;
  const rest = customId.slice("placement:answer:".length);
  const [idStr, indexStr] = rest.split(":");
  const questionId = Number(idStr);
  const index = Number(indexStr);
  if (Number.isNaN(questionId) || Number.isNaN(index)) return null;
  return { questionId, index };
}

function buildQuestionContainer(question: PlacementQuestion, current: number, total: number): ContainerBuilder {
  const container = baseContainer(`🧭 Test de positionnement — ${current}/${total}`, COLOR_TEAL).addTextDisplayComponents(
    textDisplay(question.prompt),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      question.choices.map((choice, index) =>
        new ButtonBuilder()
          .setCustomId(answerButtonId(question.id, index))
          .setLabel(`${CHOICE_LETTERS[index]}. ${choice}`.slice(0, 80))
          .setStyle(ButtonStyle.Secondary),
      ),
    ),
  );

  return container;
}

/** Première question — réponse ephemeral initiale (`/placement`). */
export function buildPlacementStartReply(question: PlacementQuestion, total: number): EphemeralContainerPayload {
  return ephemeralContainerPayload(buildQuestionContainer(question, 1, total));
}

/** Questions suivantes — `.update()` sur le même message ephemeral déjà établi (pas de flag Ephemeral ici, invalide sur update — voir container.ts). */
export function buildPlacementNextReply(question: PlacementQuestion, current: number, total: number): MessageViewPayload {
  return messageViewPayload(buildQuestionContainer(question, current, total));
}

export function buildPlacementResultReply(result: PlacementResult): MessageViewPayload {
  const lines = [
    `Niveau estimé : **${result.estimatedLevelName}** — ${result.scorePercent}% de bonnes réponses au total.`,
  ];

  if (result.weakestCategory) {
    lines.push(`\nCatégorie la moins solide : **${result.weakestCategory.label}** (${result.weakestCategory.accuracyPercent}%).`);
  }
  if (result.suggestedCourse) {
    lines.push(`\n📚 Cours suggéré pour démarrer : \`/learn cours:${result.suggestedCourse.key}\` (${result.suggestedCourse.title})`);
  }
  lines.push("\n-# `/roadmap` pour voir l'ensemble des cours disponibles.");

  const container = baseContainer("🧭 Résultat du test de positionnement", COLOR_TEAL).addTextDisplayComponents(
    textDisplay(lines.join("\n")),
  );

  return messageViewPayload(container);
}

export function buildPlacementStaleReply(): MessageViewPayload {
  const container = baseContainer("🧭 Test expiré", COLOR_TEAL).addTextDisplayComponents(
    textDisplay("Cette question ne correspond plus à ton test en cours — relance `/placement` pour recommencer."),
  );
  return messageViewPayload(container);
}
