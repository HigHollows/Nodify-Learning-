import { SlashCommandBuilder } from "discord.js";
import { getDailyObjectives } from "../../progression/dailyObjectivesService.js";
import { buildDailyObjectivesReply } from "../../progression/dailyObjectivesView.js";
import type { Command } from "../../types/command.js";

/**
 * /objectives — récapitulatif de l'engagement du jour, calculé à la volée
 * depuis les tables existantes (pas de nouvelle table de suivi). Voir
 * progression/dailyObjectivesService.ts.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("objectives")
    .setDescription("Affiche tes objectifs d'apprentissage du jour."),

  async execute(interaction) {
    const objectives = await getDailyObjectives(interaction.user.id, interaction.guildId);
    await interaction.reply(buildDailyObjectivesReply(objectives));
  },
};

export default command;
