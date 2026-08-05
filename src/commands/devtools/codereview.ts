import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { buildCodeReviewModal } from "./devtoolsView.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("codereview")
    .setDescription(
      "Fait relire un extrait de code par l'IA pour la qualité (lisibilité, nommage, duplication).",
    ),

  async execute(interaction) {
    await interaction.showModal(buildCodeReviewModal());
  },
};

export default command;
