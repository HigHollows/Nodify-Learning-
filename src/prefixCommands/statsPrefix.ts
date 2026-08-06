import { getNodifyStats } from "../services/statsService.js";
import { baseContainer, containerPayload, fieldText, textDisplay } from "../ui/container.js";
import type { PrefixCommand } from "../types/prefixCommand.js";

const COLOR_BLUE = 0x3498db;

const command: PrefixCommand = {
  name: "stats",
  description: "Statistiques globales Nodify.",
  usage: "+stats",

  async execute(message) {
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

    // Pas d'équivalent "éphémère" pour un message classique — reste visible dans le salon.
    await message.reply(containerPayload(container));
  },
};

export default command;
