import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, type InteractionReplyOptions } from "discord.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../types/skill.js";
import {
  baseContainer,
  ephemeralContainerPayload,
  messageViewPayloadWithFiles,
  textDisplay,
  triviaContainer,
  type EphemeralContainerPayload,
  type MessageViewPayload,
} from "../ui/container.js";

const CHOICE_LETTERS = ["A", "B", "C", "D"];

const COLOR_BLUE = 0x3498db;
const COLOR_GREEN = 0x57f287;
const COLOR_RED = 0xed4245;

export interface DailyQuestionForDisplay {
  key: string;
  category: string;
  prompt: string;
  choices: string[];
}

/**
 * Postée à la fois automatiquement (channel.send) et via /trivia
 * (interaction.reply) — jamais éphémère. Bannière piochée au hasard parmi 5
 * visuels dédiés (assets/trivia/) à chaque post, plutôt que la bannière
 * Nodify générique — un seul visuel par post, jamais les 5 en même temps.
 */
export function buildDailyQuestionPost(question: DailyQuestionForDisplay): MessageViewPayload {
  const categoryLabel = SKILL_CATEGORY_LABELS[question.category as SkillCategory] ?? question.category;

  const { container, attachment } = triviaContainer("🧠 Question du jour", COLOR_BLUE);
  container.addTextDisplayComponents(
    textDisplay(question.prompt),
    textDisplay(`-# ${categoryLabel} — une seule réponse comptée par jour`),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      question.choices.map((choice, index) =>
        new ButtonBuilder()
          .setCustomId(`daily:answer:${question.key}:${index}`)
          .setLabel(`${CHOICE_LETTERS[index]}. ${choice}`.slice(0, 80))
          .setStyle(ButtonStyle.Secondary),
      ),
    ),
  );

  return messageViewPayloadWithFiles(container, [attachment]);
}

export function buildDailyAnswerFeedback(correct: boolean, explanation: string): EphemeralContainerPayload {
  const container = baseContainer(correct ? "✅ Bonne réponse !" : "❌ Pas tout à fait", correct ? COLOR_GREEN : COLOR_RED).addTextDisplayComponents(
    textDisplay(explanation),
  );

  return ephemeralContainerPayload(container);
}

export function buildAlreadyAnsweredReply(): InteractionReplyOptions {
  return {
    content: "Tu as déjà répondu à la question du jour sur ce serveur — reviens demain 👋",
    flags: MessageFlags.Ephemeral, // message texte simple, jamais un embed — pas de conversion Components V2 ici
  };
}
