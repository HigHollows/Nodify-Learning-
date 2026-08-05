import { SlashCommandBuilder } from "discord.js";
import { getRecentNews } from "../../community/newsService.js";
import { buildRecentNewsReply } from "../../community/newsView.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("news")
    .setDescription("Affiche les dernières Hacktualités diffusées (Node.js, GitHub, Cloudflare)."),

  async execute(interaction) {
    const articles = await getRecentNews(5);
    await interaction.reply(buildRecentNewsReply(articles));
  },
};

export default command;
