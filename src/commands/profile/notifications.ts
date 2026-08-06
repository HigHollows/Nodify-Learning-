import { SlashCommandBuilder } from "discord.js";
import { getNotificationPreferences, setNotificationPreferences } from "../../database/repositories/userRepository.js";
import { baseContainer, containerPayload, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const COLOR_BLUE = 0x3498db;

function statusLine(label: string, enabled: boolean): string {
  return `${enabled ? "✅" : "❌"} ${label}`;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("notifications")
    .setDescription("Active/désactive les DM automatiques de Nodify.")
    .addBooleanOption((option) =>
      option.setName("rappel_streak").setDescription("Rappel en DM si ton streak est sur le point d'expirer"),
    )
    .addBooleanOption((option) => option.setName("recap_hebdo").setDescription("Récap hebdomadaire en DM chaque lundi")),

  async execute(interaction) {
    const streak = interaction.options.getBoolean("rappel_streak");
    const recap = interaction.options.getBoolean("recap_hebdo");

    const updates: Parameters<typeof setNotificationPreferences>[1] = {};
    if (streak !== null) updates.notifStreakReminders = streak;
    if (recap !== null) updates.notifWeeklyRecap = recap;

    if (Object.keys(updates).length > 0) {
      await setNotificationPreferences(interaction.user.id, updates);
    }

    const prefs = await getNotificationPreferences(interaction.user.id);

    const container = baseContainer("🔔 Notifications", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        [
          statusLine("Rappel de streak (DM)", prefs.notifStreakReminders),
          statusLine("Récap hebdomadaire (DM)", prefs.notifWeeklyRecap),
        ].join("\n"),
      ),
      textDisplay(`-# ${Object.keys(updates).length > 0 ? "Préférences mises à jour." : "Aucun changement demandé — voici l'état actuel."}`),
    );

    await interaction.reply(containerPayload(container));
  },
};

export default command;
