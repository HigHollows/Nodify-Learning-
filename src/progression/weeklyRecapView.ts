import { baseContainer, EmbedColors, messageViewPayload, textDisplay, type MessageViewPayload } from "../ui/container.js";

export interface WeeklyRecapStats {
  lessonsCompleted: number;
  ctfSolved: number;
  exercisesSolved: number;
  achievementsUnlocked: { name: string; icon: string }[];
  currentStreak: number;
}

export function buildWeeklyRecapDm(stats: WeeklyRecapStats): MessageViewPayload {
  const lines = [
    `📚 **${stats.lessonsCompleted}** leçon${stats.lessonsCompleted > 1 ? "s" : ""} Academy terminée${stats.lessonsCompleted > 1 ? "s" : ""}`,
    `🚩 **${stats.ctfSolved}** défi${stats.ctfSolved > 1 ? "s" : ""} CTF résolu${stats.ctfSolved > 1 ? "s" : ""}`,
    `🏋️ **${stats.exercisesSolved}** exercice${stats.exercisesSolved > 1 ? "s" : ""} pratique${stats.exercisesSolved > 1 ? "s" : ""}`,
  ];

  if (stats.achievementsUnlocked.length > 0) {
    lines.push(`\n🏆 Badges débloqués : ${stats.achievementsUnlocked.map((a) => `${a.icon} ${a.name}`).join(", ")}`);
  }

  if (stats.currentStreak > 0) {
    lines.push(`\n🔥 Streak actuel : **${stats.currentStreak} jour${stats.currentStreak > 1 ? "s" : ""}**`);
  }

  const container = baseContainer("📈 Ton récap de la semaine", EmbedColors.info).addTextDisplayComponents(
    textDisplay(lines.join("\n")),
    textDisplay("-# `/profile` pour le détail complet de ta progression."),
  );

  return messageViewPayload(container);
}
