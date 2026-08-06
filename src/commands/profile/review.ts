import { SlashCommandBuilder } from "discord.js";
import { getConceptsDueForReview } from "../../progression/spacedRepetitionService.js";
import { buildReviewReply } from "../../progression/spacedRepetitionView.js";
import type { Command } from "../../types/command.js";

/**
 * /review — révision espacée : reproposition d'anciens concepts du
 * dictionnaire déjà consultés (voir progression/spacedRepetitionService.ts).
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("review")
    .setDescription("Révise quelques concepts du dictionnaire que tu avais déjà consultés."),

  async execute(interaction) {
    const concepts = await getConceptsDueForReview(interaction.user.id);
    await interaction.reply(buildReviewReply(concepts));
  },
};

export default command;
