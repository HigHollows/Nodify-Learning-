import { SlashCommandBuilder } from "discord.js";
import { getCreditStats } from "../../credits/creditService.js";
import { buildStatsReply } from "../../credits/creditView.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("credit-stats")
    .setDescription("Tes statistiques détaillées de crédits et d'usage IA."),

  async execute(interaction) {
    const stats = await getCreditStats(interaction.user.id);
    await interaction.reply(buildStatsReply(interaction.user.username, stats));
  },
};

export default command;
