import { baseContainer, EmbedColors, messageViewPayload, textDisplay, type MessageViewPayload } from "../ui/container.js";

export function buildStreakReminderDm(currentStreak: number): MessageViewPayload {
  const container = baseContainer("🔥 Ton streak est en danger !", EmbedColors.warning).addTextDisplayComponents(
    textDisplay(
      `Tu as un streak de **${currentStreak} jour${currentStreak > 1 ? "s" : ""}** — mais pas encore d'activité aujourd'hui. ` +
        "Il reste quelques heures avant minuit (UTC) pour le prolonger.\n\n" +
        "N'importe quelle interaction Nodify compte : réponds à `/trivia`, termine une leçon avec `/learn`, résous un exercice avec `/exercise practice`...",
    ),
  );

  return messageViewPayload(container);
}
