import { SlashCommandBuilder } from "discord.js";
import { getTodaysQuestion, toDisplay } from "../../community/dailyQuestionService.js";
import { buildDailyQuestionPost } from "../../community/dailyQuestionView.js";
import { assertModuleEnabled } from "../../setup/guildSettingsService.js";
import type { Command } from "../../types/command.js";

/**
 * Affiche la question du jour à la demande — utile si le post automatique
 * dans le salon hub n'est pas encore passé, ou si l'utilisateur veut la
 * revoir depuis un autre salon. Répondre reste limité à une fois par jour
 * par guild, peu importe par où on y répond (voir dailyQuestionService).
 *
 * Renommée `/daily` → `/trivia` (AI Credit System) : `/daily` désigne
 * maintenant la récompense de crédits quotidienne, un nom plus attendu vu
 * l'ampleur du Credit Engine — cette question-trivia garde son propre nom
 * clair plutôt que d'entrer en collision.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("trivia")
    .setDescription("Affiche la question du jour Nodify (trivia tech/cyber)."),

  async execute(interaction) {
    await assertModuleEnabled(interaction.guildId, "dailyQuestion");

    const question = await getTodaysQuestion();
    await interaction.reply(buildDailyQuestionPost(toDisplay(question)));
  },
};

export default command;
