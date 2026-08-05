import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { buildDictionaryHomeReply, replyWithConceptSearch } from "./dictionaryView.js";

/**
 * Implémentation partagée par /dictionary, /dict, /term, /define — Discord
 * n'a pas de vraie notion d'alias de slash command, donc chaque alias est
 * un fichier de commande fin qui délègue ici (voir dictionary.ts, dict.ts...).
 */
export function createDictionaryCommand(name: string, description: string): Command {
  return {
    data: new SlashCommandBuilder()
      .setName(name)
      .setDescription(description)
      .addStringOption((option) =>
        option
          .setName("terme")
          .setDescription("Le terme à rechercher (ex: JWT, Promise, XSS...)")
          .setRequired(false),
      ),

    async execute(interaction) {
      const terme = interaction.options.getString("terme");

      if (!terme) {
        await interaction.reply(buildDictionaryHomeReply());
        return;
      }

      await replyWithConceptSearch(interaction, terme);
    },
  };
}
