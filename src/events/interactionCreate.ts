import {
  MessageFlags,
  type Interaction,
  type InteractionReplyOptions,
} from "discord.js";
import type { NodifyClient } from "../client.js";
import { recordActivity } from "../services/userService.js";
import type { Event } from "../types/event.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("interactionCreate");

const event: Event<"interactionCreate"> = {
  name: "interactionCreate",
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as NodifyClient;
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      log.warn({ commandName: interaction.commandName }, "Commande inconnue reçue");
      return;
    }

    // Résilient : un profil non mis à jour ne doit jamais empêcher une commande
    // de s'exécuter — on log et on continue plutôt que de bloquer l'utilisateur.
    await recordActivity({ id: interaction.user.id, username: interaction.user.username }).catch(
      (error: unknown) => {
        log.warn({ err: error, userId: interaction.user.id }, "Échec de recordActivity");
      },
    );

    try {
      await command.execute(interaction);
    } catch (error) {
      const userMessage =
        error instanceof AppError
          ? error.userMessage
          : "Une erreur inattendue est survenue. L'équipe Nodify a été notifiée.";

      log.error(
        {
          err: error,
          command: interaction.commandName,
          userId: interaction.user.id,
          guildId: interaction.guildId,
        },
        "Erreur pendant l'exécution d'une commande",
      );

      const payload: InteractionReplyOptions = {
        content: `❌ ${userMessage}`,
        flags: MessageFlags.Ephemeral,
      };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => undefined);
      } else {
        await interaction.reply(payload).catch(() => undefined);
      }
    }
  },
};

export default event;
