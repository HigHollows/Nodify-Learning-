import { SlashCommandBuilder } from "discord.js";
import { searchAll } from "../../search/searchService.js";
import { buildSearchReply } from "../../search/searchView.js";
import type { Command } from "../../types/command.js";

/**
 * /search — recherche unifiée floue à travers dictionnaire, cours Academy,
 * défis CTF et exercices pratiques. Point d'entrée unique plutôt que de
 * deviner dans quelle commande chercher (voir search/searchService.ts).
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("search")
    .setDescription("Recherche à travers tout le contenu Nodify (dictionnaire, cours, CTF, exercices).")
    .addStringOption((option) =>
      option.setName("terme").setDescription("Ce que tu cherches").setRequired(true).setMaxLength(100),
    ),

  async execute(interaction) {
    const query = interaction.options.getString("terme", true);
    const results = await searchAll(query);
    await interaction.reply(buildSearchReply(query, results));
  },
};

export default command;
