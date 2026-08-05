import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { buildLeaderboard } from "../../services/profileService.js";
import type { Command } from "../../types/command.js";

const RANK_ICON: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Classement Nodify par XP (toutes guildes confondues)."),

  async execute(interaction) {
    const entries = await buildLeaderboard(10);

    const embed = new EmbedBuilder().setTitle("🏆 Classement Nodify").setColor("Gold");

    if (entries.length === 0) {
      embed.setDescription(
        "Personne n'a encore gagné d'XP — termine une leçon sur `/learn` ou `/cyber learn` pour apparaître ici !",
      );
    } else {
      embed.setDescription(
        entries
          .map(
            (e) =>
              `${RANK_ICON[e.rank] ?? `**#${e.rank}**`} **${e.username}** — ${e.totalXp} XP (${e.levelName})`,
          )
          .join("\n"),
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

export default command;
