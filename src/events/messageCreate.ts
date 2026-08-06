import { MessageFlags, PermissionFlagsBits, type Message } from "discord.js";
import type { Event } from "../types/event.js";
import { PREFIX, PREFIX_COMMANDS } from "../prefixCommands/registry.js";
import { parsePrefixArgs, tokenize } from "../prefixCommands/parseArgs.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("messageCreate");

/**
 * Route les commandes admin en préfixe `+` (voir prefixCommands/) — jamais
 * de réponse à un message qui ne matche AUCUNE commande + connue (juste un
 * message qui commence par "+" par coïncidence), pour ne pas polluer le
 * salon de faux messages d'erreur.
 *
 * Permission vérifiée manuellement ici (ManageGuild) : contrairement aux
 * slash commands, un message texte n'a pas de gate natif Discord — c'est
 * la seule vraie barrière de sécurité de tout ce système.
 */
async function handleMessage(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const withoutPrefix = message.content.slice(PREFIX.length).trim();
  if (!withoutPrefix) return;

  const tokens = tokenize(withoutPrefix);
  const commandName = tokens[0]?.toLowerCase();
  if (!commandName) return;

  const command = PREFIX_COMMANDS.get(commandName);
  if (!command) return;

  if (!message.inGuild()) {
    await message.reply("❌ Cette commande ne fonctionne que sur un serveur.").catch(() => undefined);
    return;
  }

  if (!message.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
    await message.reply("❌ Tu n'as pas la permission d'utiliser cette commande (Gérer le serveur requis).").catch(() => undefined);
    return;
  }

  const args = parsePrefixArgs(tokens.slice(1));

  try {
    await command.execute(message, args);
  } catch (error) {
    const userMessage = error instanceof AppError ? error.userMessage : "Une erreur inattendue est survenue.";
    log.error(
      { err: error, command: commandName, userId: message.author.id, guildId: message.guildId },
      "Erreur pendant le traitement d'une commande +",
    );
    await message.reply({ content: `❌ ${userMessage}`, flags: MessageFlags.SuppressEmbeds }).catch(() => undefined);
  }
}

const event: Event<"messageCreate"> = {
  name: "messageCreate",
  async execute(message) {
    await handleMessage(message).catch((error: unknown) => {
      log.error({ err: error }, "Échec inattendu du routage d'une commande +");
    });
  },
};

export default event;
