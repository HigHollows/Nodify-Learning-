import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getNodifyStats } from "../../services/statsService.js";
import { baseContainer, ephemeralContainerPayload, fieldText, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const COLOR_BLUE = 0x3498db;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Statistiques globales Nodify (admin).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    const stats = await getNodifyStats();

    const container = baseContainer("📊 Statistiques Nodify", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        [
          fieldText("Utilisateurs", `${stats.totalUsers}`),
          fieldText("XP totale distribuée", `${stats.totalXpAwarded}`),
          fieldText("Streak moyen", `${stats.averageStreak} jour(s)`),
          fieldText("Leçons validées", `${stats.totalLessonsCompleted}`),
          fieldText("Défis CTF résolus", `${stats.totalCtfSolves}`),
          fieldText(
            "Cours le plus commencé",
            stats.mostStartedCourseTitle
              ? `${stats.mostStartedCourseTitle} (${stats.mostStartedCourseCount} démarrage(s))`
              : "Aucun cours démarré pour l'instant",
          ),
        ].join("\n"),
      ),
    );

    await interaction.reply(ephemeralContainerPayload(container));
  },
};

export default command;
