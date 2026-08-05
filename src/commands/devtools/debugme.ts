import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { buildDebugModal } from "./devtoolsView.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("debugme")
    .setDescription(
      "Debug Coach : décris ton erreur, l'IA te guide avec des questions plutôt que de donner la solution.",
    ),

  async execute(interaction) {
    await interaction.showModal(buildDebugModal());
  },
};

export default command;
