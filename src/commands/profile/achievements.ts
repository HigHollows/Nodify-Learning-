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
      // Verrouillé : nom + condition révélés (donne un vrai objectif à
      // viser), seule l'icône reste cachée — un mystère total ("???") sans
      // aucun indice est moins motivant qu'un objectif clair à atteindre.
      return unlocked ? `${a.icon} **${a.name}** — ${a.description}` : `🔒 **${a.name}** — _${a.description}_`;
    });

    const container = baseContainer(`🏆 Badges Nodify (${earned.size}/${all.length})`, COLOR_GOLD).addTextDisplayComponents(
      textDisplay(lines.join("\n")),
    );

    await interaction.reply(containerPayload(container));
  },
};

export default command;
