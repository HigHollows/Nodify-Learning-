import { SlashCommandBuilder } from "discord.js";
import { getWeakestCategory } from "../../progression/weakSpotsService.js";
import { buildWeakSpotsReply } from "../../progression/weakSpotsView.js";
import type { Command } from "../../types/command.js";

/**
 * /weakspots — repère la catégorie où l'utilisateur se trompe le plus
 * (question du jour + quiz Academy combinés), suggère quoi réviser en
 * priorité. Voir progression/weakSpotsService.ts.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("weakspots")
    .setDescription("Identifie ta catégorie la moins solide et te suggère quoi réviser."),

  async execute(interaction) {
    const weakSpot = await getWeakestCategory(interaction.user.id);
    await interaction.reply(buildWeakSpotsReply(weakSpot));
  },
};

export default command;
