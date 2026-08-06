import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { DuelState } from "./duelService.js";
import { baseContainer, containerPayload, EmbedColors, textDisplay, type ContainerPayload } from "../ui/container.js";

const CHOICE_LETTERS = ["A", "B", "C", "D"];

function acceptButtonId(duelId: string): string {
  return `duel:accept:${duelId}`;
}
function declineButtonId(duelId: string): string {
  return `duel:decline:${duelId}`;
}
function answerButtonId(duelId: string, index: number): string {
  return `duel:answer:${duelId}:${index}`;
}

export function parseDuelAcceptButtonId(customId: string): string | null {
  return customId.startsWith("duel:accept:") ? customId.slice("duel:accept:".length) : null;
}
export function parseDuelDeclineButtonId(customId: string): string | null {
  return customId.startsWith("duel:decline:") ? customId.slice("duel:decline:".length) : null;
}
export function parseDuelAnswerButtonId(customId: string): { duelId: string; index: number } | null {
  if (!customId.startsWith("duel:answer:")) return null;
  const rest = customId.slice("duel:answer:".length);
  const lastColon = rest.lastIndexOf(":");
  if (lastColon === -1) return null;
  const duelId = rest.slice(0, lastColon);
  const index = Number(rest.slice(lastColon + 1));
  if (!duelId || Number.isNaN(index)) return null;
  return { duelId, index };
}

export function buildDuelChallengeReply(challengerId: string, opponentId: string, duelId: string) {
  const container = baseContainer("⚔️ Duel de trivia", EmbedColors.warning).addTextDisplayComponents(
    textDisplay(
      `<@${challengerId}> défie <@${opponentId}> en duel de trivia ! Premier à trouver la bonne réponse gagne.\n\n` +
        "-# Expire dans 2 minutes si non accepté.",
    ),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(acceptButtonId(duelId)).setLabel("⚔️ Accepter").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(declineButtonId(duelId)).setLabel("❌ Refuser").setStyle(ButtonStyle.Secondary),
    ),
  );

  return containerPayload(container);
}

export function buildDuelDeclinedReply(): ContainerPayload {
  return containerPayload(
    baseContainer("⚔️ Duel refusé", EmbedColors.neutral).addTextDisplayComponents(textDisplay("Le duel a été refusé.")),
  );
}

export function buildDuelExpiredReply(): ContainerPayload {
  return containerPayload(
    baseContainer("⚔️ Duel expiré", EmbedColors.neutral).addTextDisplayComponents(
      textDisplay("Personne n'a répondu à temps — le duel est annulé."),
    ),
  );
}

export function buildDuelQuestionReply(duel: DuelState) {
  if (!duel.question) throw new Error("Duel actif sans question — état incohérent");

  const container = baseContainer("⚔️ Duel — à vos claviers !", EmbedColors.warning).addTextDisplayComponents(
    textDisplay(duel.question.prompt),
    textDisplay(`-# <@${duel.challengerId}> vs <@${duel.opponentId}> — premier à trouver la bonne réponse gagne (30s)`),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      duel.question.choices.map((choice, index) =>
        new ButtonBuilder()
          .setCustomId(answerButtonId(duel.id, index))
          .setLabel(`${CHOICE_LETTERS[index]}. ${choice}`.slice(0, 80))
          .setStyle(ButtonStyle.Secondary),
      ),
    ),
  );

  return containerPayload(container);
}

export function buildDuelWinReply(winnerId: string, explanation: string): ContainerPayload {
  return containerPayload(
    baseContainer("🏆 Duel terminé !", EmbedColors.operational).addTextDisplayComponents(
      textDisplay(`<@${winnerId}> a trouvé la bonne réponse en premier !\n\n${explanation}`),
    ),
  );
}

export function buildDuelDrawReply(explanation: string): ContainerPayload {
  return containerPayload(
    baseContainer("🤝 Duel nul", EmbedColors.neutral).addTextDisplayComponents(
      textDisplay(`Personne n'a trouvé la bonne réponse.\n\n${explanation}`),
    ),
  );
}
