import {
  MessageFlags,
  type Interaction,
  type InteractionReplyOptions,
  type RepliableInteraction,
} from "discord.js";
import type { NodifyClient } from "../client.js";
import {
  DICTIONARY_SEARCH_BUTTON_ID,
  DICTIONARY_SEARCH_MODAL_ID,
  parseExplainCustomId,
} from "../commands/knowledge/dictionaryView.js";
import {
  handleExplainToggle,
  handleSearchButton,
  handleSearchModalSubmit,
} from "../interactions/dictionaryInteractions.js";
import { recordActivity } from "../services/userService.js";
import type { Event } from "../types/event.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("interactionCreate");

/**
 * Exécute un handler d'interaction avec les mêmes garanties partout :
 * tracking d'activité (résilient) + capture d'erreur avec message propre
 * à l'utilisateur. Partagé par les slash commands et les interactions
 * (boutons/modals) du dictionnaire — évite de dupliquer ce filet de
 * sécurité à chaque nouveau type d'interaction.
 */
async function runWithGuards(
  interaction: RepliableInteraction,
  label: string,
  handler: () => Promise<void>,
): Promise<void> {
  await recordActivity({ id: interaction.user.id, username: interaction.user.username }).catch(
    (error: unknown) => {
      log.warn({ err: error, userId: interaction.user.id }, "Échec de recordActivity");
    },
  );

  try {
    await handler();
  } catch (error) {
    const userMessage =
      error instanceof AppError
        ? error.userMessage
        : "Une erreur inattendue est survenue. L'équipe Nodify a été notifiée.";

    log.error(
      { err: error, label, userId: interaction.user.id, guildId: interaction.guildId },
      "Erreur pendant le traitement d'une interaction",
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
}

const event: Event<"interactionCreate"> = {
  name: "interactionCreate",
  async execute(interaction: Interaction) {
    if (interaction.isChatInputCommand()) {
      const client = interaction.client as NodifyClient;
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        log.warn({ commandName: interaction.commandName }, "Commande inconnue reçue");
        return;
      }

      await runWithGuards(interaction, interaction.commandName, () => command.execute(interaction));
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === DICTIONARY_SEARCH_BUTTON_ID) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleSearchButton(interaction),
        );
        return;
      }

      if (parseExplainCustomId(interaction.customId)) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleExplainToggle(interaction),
        );
        return;
      }

      log.warn({ customId: interaction.customId }, "Bouton inconnu reçu");
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === DICTIONARY_SEARCH_MODAL_ID) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleSearchModalSubmit(interaction),
        );
        return;
      }

      log.warn({ customId: interaction.customId }, "Modal inconnu reçu");
    }
  },
};

export default event;
