import { MessageFlags, type ButtonInteraction } from "discord.js";
import { activateDuel, answerDuel, declineDuel, getDuel } from "../social/duelService.js";
import {
  buildDuelDeclinedReply,
  buildDuelDrawReply,
  buildDuelExpiredReply,
  buildDuelQuestionReply,
  buildDuelWinReply,
} from "../social/duelView.js";
import { recordDuelDraw, recordDuelWin } from "../database/repositories/userRepository.js";
import { AppError } from "../utils/errors.js";

export async function handleDuelAcceptButton(interaction: ButtonInteraction, duelId: string): Promise<void> {
  const pending = getDuel(duelId);
  if (!pending) {
    await interaction.update(buildDuelExpiredReply());
    return;
  }
  if (interaction.user.id !== pending.opponentId) {
    throw new AppError("Seule la personne défiée peut accepter ce duel.");
  }

  const duel = await activateDuel(duelId);
  if (!duel) {
    await interaction.update(buildDuelExpiredReply());
    return;
  }

  await interaction.update(buildDuelQuestionReply(duel));
}

export async function handleDuelDeclineButton(interaction: ButtonInteraction, duelId: string): Promise<void> {
  const pending = getDuel(duelId);
  if (pending && interaction.user.id !== pending.opponentId) {
    throw new AppError("Seule la personne défiée peut refuser ce duel.");
  }

  declineDuel(duelId);
  await interaction.update(buildDuelDeclinedReply());
}

export async function handleDuelAnswerButton(
  interaction: ButtonInteraction,
  duelId: string,
  choiceIndex: number,
): Promise<void> {
  const outcome = answerDuel(duelId, interaction.user.id, choiceIndex);

  switch (outcome.result) {
    case "win":
      // Persisté après la mise à jour du message : un échec de la stat ne
      // doit jamais empêcher le duel de se conclure visiblement.
      await interaction.update(buildDuelWinReply(outcome.winnerId, outcome.explanation));
      await recordDuelWin(outcome.winnerId, outcome.loserId).catch(() => undefined);
      return;
    case "draw":
      await interaction.update(buildDuelDrawReply(outcome.explanation));
      await recordDuelDraw(outcome.challengerId, outcome.opponentId).catch(() => undefined);
      return;
    case "wrong":
      await interaction.reply({
        content: "❌ Mauvaise réponse — le duel continue pour l'autre joueur, tu ne peux plus retenter sur cette question.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    case "already-failed":
      await interaction.reply({ content: "Tu as déjà utilisé ta chance sur cette question.", flags: MessageFlags.Ephemeral });
      return;
    case "not-your-duel":
      await interaction.reply({ content: "Ce duel ne te concerne pas.", flags: MessageFlags.Ephemeral });
      return;
    case "duel-over":
      await interaction.update(buildDuelExpiredReply());
      return;
  }
}
