import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  type InteractionReplyOptions,
} from "discord.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../types/skill.js";

const CHOICE_LETTERS = ["A", "B", "C", "D"];

export interface DailyQuestionForDisplay {
  key: string;
  category: string;
  prompt: string;
  choices: string[];
}

export function buildDailyQuestionPost(question: DailyQuestionForDisplay) {
  const categoryLabel =
    SKILL_CATEGORY_LABELS[question.category as SkillCategory] ?? question.category;

  const embed = new EmbedBuilder()
    .setTitle("🧠 Question du jour")
    .setColor("Blue")
    .setDescription(question.prompt)
    .setFooter({ text: `${categoryLabel} — une seule réponse comptée par jour` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    question.choices.map((choice, index) =>
      new ButtonBuilder()
        .setCustomId(`daily:answer:${question.key}:${index}`)
        .setLabel(`${CHOICE_LETTERS[index]}. ${choice}`.slice(0, 80))
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return { embeds: [embed], components: [row] };
}

export function buildDailyAnswerFeedback(
  correct: boolean,
  explanation: string,
): InteractionReplyOptions {
  const embed = new EmbedBuilder()
    .setTitle(correct ? "✅ Bonne réponse !" : "❌ Pas tout à fait")
    .setColor(correct ? "Green" : "Red")
    .setDescription(explanation);

  return { embeds: [embed], flags: MessageFlags.Ephemeral };
}

export function buildAlreadyAnsweredReply(): InteractionReplyOptions {
  return {
    content: "Tu as déjà répondu à la question du jour sur ce serveur — reviens demain 👋",
    flags: MessageFlags.Ephemeral,
  };
}
