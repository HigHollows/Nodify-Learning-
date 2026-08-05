import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { Command } from "./types/command.js";

/**
 * Client Discord étendu avec une Collection de commandes attachée dessus.
 * Permet au handler `interactionCreate` de retrouver la bonne commande
 * sans dépendre d'un import global.
 *
 * Intents minimaux pour l'instant : Nodify n'a pas besoin de lire le
 * contenu des messages ni de tracker la présence des membres en Phase 1.
 * On élargira uniquement quand une fonctionnalité concrète le justifiera
 * (ex: MessageContent si on ajoute un jour de la détection en message).
 */
export class NodifyClient extends Client {
  public commands = new Collection<string, Command>();

  constructor() {
    super({
      intents: [GatewayIntentBits.Guilds],
    });
  }
}
