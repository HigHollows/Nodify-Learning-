import { SlashCommandBuilder } from "discord.js";
import { getRoadmap } from "../../progression/roadmapService.js";
import { buildRoadmapReply } from "../../progression/roadmapView.js";
import type { Command } from "../../types/command.js";

/**
 * /roadmap — vue d'ensemble de tous les cours Academy, groupés par
 * catégorie, avec prérequis et statut — pour visualiser l'ordre logique
 * plutôt que de deviner (voir progression/roadmapService.ts).
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("roadmap")
    .setDescription("Vue d'ensemble de tous les cours Academy et de leurs prérequis."),

  async execute(interaction) {
    const courses = await getRoadmap(interaction.user.id);
    await interaction.reply(buildRoadmapReply(courses));
  },
};

export default command;
