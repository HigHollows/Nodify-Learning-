import { SlashCommandBuilder } from "discord.js";
import { listAllAchievements, listEarnedAchievementKeys } from "../../database/repositories/achievementRepository.js";
import { baseContainer, containerPayload, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const COLOR_GOLD = 0xf1c40f;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Galerie de tous les badges Nodify — débloqués et à débloquer."),

  async execute(interaction) {
    const [all, earned] = await Promise.all([listAllAchievements(), listEarnedAchievementKeys(interaction.user.id)]);

    const lines = all.map((a) => {
      const unlocked = earned.has(a.key);
      return unlocked ? `${a.icon} **${a.name}** — ${a.description}` : `🔒 *???* — débloque-le pour voir de quoi il s'agit`;
    });

    const container = baseContainer(`🏆 Badges Nodify (${earned.size}/${all.length})`, COLOR_GOLD).addTextDisplayComponents(
      textDisplay(lines.join("\n")),
    );

    await interaction.reply(containerPayload(container));
  },
};

export default command;
