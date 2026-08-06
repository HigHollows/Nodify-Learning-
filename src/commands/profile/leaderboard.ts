import { SlashCommandBuilder } from "discord.js";
import { buildLeaderboard } from "../../services/profileService.js";
import { baseContainer, containerPayload, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const RANK_ICON: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const COLOR_GOLD = 0xf1c40f;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Classement Nodify par XP (toutes guildes confondues)."),

  async execute(interaction) {
    const entries = await buildLeaderboard(10);

    const description =
      entries.length === 0
        ? "Personne n'a encore gagné d'XP — termine une leçon sur `/learn` ou `/cyber learn` pour apparaître ici !"
        : entries
            .map((e) => `${RANK_ICON[e.rank] ?? `**#${e.rank}**`} **${e.username}** — ${e.totalXp} XP (${e.levelName})`)
            .join("\n");

    const container = baseContainer("🏆 Classement Nodify", COLOR_GOLD).addTextDisplayComponents(textDisplay(description));

    await interaction.reply(containerPayload(container));
  },
};

export default command;
