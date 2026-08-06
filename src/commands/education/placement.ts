import { SlashCommandBuilder } from "discord.js";
import { startPlacement } from "../../placement/placementService.js";
import { buildPlacementStartReply } from "../../placement/placementView.js";
import { PLACEMENT_QUESTIONS } from "../../placement/placementQuestions.js";
import type { Command } from "../../types/command.js";

/**
 * /placement — test de positionnement rapide (18 questions, ephemeral)
 * pour estimer le niveau réel d'un utilisateur et lui suggérer un cours de
 * départ, plutôt que de le laisser deviner par où commencer parmi tous les
 * cours Academy. Voir placement/placementService.ts.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("placement")
    .setDescription("Test de positionnement rapide pour estimer ton niveau et te suggérer un cours de départ."),

  async execute(interaction) {
    const firstQuestion = startPlacement(interaction.user.id);
    await interaction.reply(buildPlacementStartReply(firstQuestion, PLACEMENT_QUESTIONS.length));
  },
};

export default command;
