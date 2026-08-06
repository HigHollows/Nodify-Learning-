import { SlashCommandBuilder } from "discord.js";
import { handleGuideCommand } from "../../interactions/guideInteractions.js";
import type { Command } from "../../types/command.js";

/**
 * /guide — envoie en DM une explication complète de Nodify (fonctionnalités,
 * commandes principales, progression). Le contenu détaillé vit dans
 * community/guideView.ts, partagé avec le bouton du post public du salon hub.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("guide")
    .setDescription("Reçois en message privé un guide complet sur le fonctionnement de Nodify."),

  async execute(interaction) {
    await handleGuideCommand(interaction);
  },
};

export default command;
