import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { buildThreatModelModal } from "../../cybersecurity/threatModelView.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("threatmodel")
    .setDescription(
      "Décris une architecture ou un flux, l'IA identifie les risques et protections.",
    ),

  async execute(interaction) {
    await interaction.showModal(buildThreatModelModal());
  },
};

export default command;
