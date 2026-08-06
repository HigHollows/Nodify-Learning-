import type { MessageCreateOptions, MessagePayload, User } from "discord.js";
import { childLogger } from "./logger.js";

const log = childLogger("dm");

/**
 * Tente d'envoyer un message privé à un utilisateur — retourne le message
 * envoyé, ou `null` si le DM a échoué (DMs fermés pour ce serveur, bot
 * bloqué, compte supprimé...). N'expose jamais de contenu privé (code,
 * analyse) dans un salon : à l'appelant de décider comment informer
 * l'utilisateur en cas d'échec (toujours un message générique et court).
 */
export async function trySendDirectMessage(
  user: User,
  payload: string | MessagePayload | MessageCreateOptions,
) {
  try {
    return await user.send(payload);
  } catch (error) {
    log.warn({ err: error, userId: user.id }, "Échec de l'envoi d'un message privé");
    return null;
  }
}
