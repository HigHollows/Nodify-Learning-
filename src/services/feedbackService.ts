import type { Client } from "discord.js";
import { createFeedbackReport, listRecentFeedbackReports } from "../database/repositories/feedbackRepository.js";
import { env } from "../config/env.js";
import { baseContainer, EmbedColors, messageViewPayload, textDisplay } from "../ui/container.js";
import { trySendDirectMessage } from "../utils/dm.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("feedbackService");

export interface SubmitFeedbackResult {
  ownerNotified: boolean;
}

/**
 * Persiste TOUJOURS le signalement (jamais perdu, consultable via
 * `+feedback`) — le DM au propriétaire (OWNER_DISCORD_ID) est un bonus
 * best-effort par-dessus, pas la seule trace.
 */
export async function submitFeedback(
  client: Client,
  userId: string,
  username: string,
  guildId: string | null,
  message: string,
): Promise<SubmitFeedbackResult> {
  await createFeedbackReport(userId, guildId, message);

  if (!env.OWNER_DISCORD_ID) return { ownerNotified: false };

  try {
    const owner = await client.users.fetch(env.OWNER_DISCORD_ID);
    const container = baseContainer("📬 Nouveau feedback Nodify", EmbedColors.info).addTextDisplayComponents(
      textDisplay(`**De :** ${username} (\`${userId}\`)${guildId ? `\n**Serveur :** \`${guildId}\`` : " (DM)"}`),
      textDisplay(message),
    );
    const sent = await trySendDirectMessage(owner, messageViewPayload(container));
    return { ownerNotified: sent !== null };
  } catch (error) {
    log.warn({ err: error }, "Échec de la notification du propriétaire pour un feedback");
    return { ownerNotified: false };
  }
}

export async function getRecentFeedback(limit: number) {
  return listRecentFeedbackReports(limit);
}
