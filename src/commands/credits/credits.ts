import { SlashCommandBuilder } from "discord.js";
import { buildCreditsGuideReply } from "../../credits/creditView.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("credits")
    .setDescription("Explique le système de crédits Nodify : solde, récompenses, coûts IA."),

  async execute(interaction) {
    await interaction.reply(buildCreditsGuideReply());
  },
};

export default command;
