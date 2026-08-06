import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Command } from "./types/command.js";

/**
 * Client Discord étendu avec une Collection de commandes attachée dessus.
 * Permet au handler `interactionCreate` de retrouver la bonne commande
 * sans dépendre d'un import global.
 *
 * GuildMessages + MessageContent (Phase 11) : nécessaires pour les
 * commandes admin en préfixe `+` (voir src/prefixCommands/) — Discord ne
 * transmet le contenu d'un message que si MessageContent est explicitement
 * demandé. MessageContent est un intent privilégié : il doit AUSSI être
 * activé manuellement dans le Discord Developer Portal (Bot → Privileged
 * Gateway Intents → Message Content Intent), sinon le bot se connecte mais
 * reçoit un contenu vide pour tous les messages.
 */
export class NodifyClient extends Client {
  public commands = new Collection<string, Command>();

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
  }
}
