import { EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getNodifyStats } from "../../services/statsService.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Statistiques globales Nodify (admin).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const stats = await getNodifyStats();

    const embed = new EmbedBuilder()
      .setTitle("📊 Statistiques Nodify")
      .setColor("Blue")
      .addFields(
        { name: "Utilisateurs", value: `${stats.totalUsers}`, inline: true },
        { name: "XP totale distribuée", value: `${stats.totalXpAwarded}`, inline: true },
        { name: "Streak moyen", value: `${stats.averageStreak} jour(s)`, inline: true },
        { name: "Leçons validées", value: `${stats.totalLessonsCompleted}`, inline: true },
        { name: "Défis CTF résolus", value: `${stats.totalCtfSolves}`, inline: true },
        {
          name: "Cours le plus commencé",
          value: stats.mostStartedCourseTitle
            ? `${stats.mostStartedCourseTitle} (${stats.mostStartedCourseCount} démarrage(s))`
            : "Aucun cours démarré pour l'instant",
          inline: true,
        },
      );

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

export default command;
