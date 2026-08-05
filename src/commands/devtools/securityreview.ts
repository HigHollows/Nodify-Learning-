import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { buildSecurityReviewModal } from "./devtoolsView.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("securityreview")
    .setDescription("Fait analyser un extrait de code par l'IA pour des problèmes de sécurité."),

  async execute(interaction) {
    await interaction.showModal(buildSecurityReviewModal());
  },
};

export default command;
