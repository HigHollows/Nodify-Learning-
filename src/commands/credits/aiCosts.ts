import { SlashCommandBuilder } from "discord.js";
import { buildAiCostsReply } from "../../credits/creditView.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ai-costs")
    .setDescription("Coût en crédits de chaque fonctionnalité IA de Nodify."),

  async execute(interaction) {
    await interaction.reply(buildAiCostsReply());
  },
};

export default command;
