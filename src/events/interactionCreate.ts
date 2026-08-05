import {
  MessageFlags,
  type ButtonInteraction,
  type Interaction,
  type InteractionReplyOptions,
  type RepliableInteraction,
} from "discord.js";
import type { NodifyClient } from "../client.js";
import { parseAcademyCustomId } from "../commands/education/academyCustomId.js";
import {
  DICTIONARY_SEARCH_BUTTON_ID,
  DICTIONARY_SEARCH_MODAL_ID,
  parseExplainCustomId,
} from "../commands/knowledge/dictionaryView.js";
import {
  handleAnswer,
  handleBeginQuiz,
  handleFinishLesson,
  handleListButton,
  handleNextQuestion,
  handleRestartLesson,
  handleStartCourse,
} from "../interactions/academyInteractions.js";
import {
  handleExplainToggle,
  handleSearchButton,
  handleSearchModalSubmit,
} from "../interactions/dictionaryInteractions.js";
import {
  handleTrustExecute,
  handleTrustIgnore,
  handleTrustRestart,
  handleTrustVerify,
  handleTrustVerifyExecuteAnyway,
  handleTrustVerifyRefuse,
} from "../interactions/trustSimulationInteractions.js";
import {
  TRUST_RESTART_CUSTOM_ID,
  TRUST_START_CUSTOM_ID,
  TRUST_VERIFY_CUSTOM_ID,
} from "../cybersecurity/trustSimulationView.js";
import {
  CODE_REVIEW_MODAL_ID,
  DEBUGME_MODAL_ID,
  SECURITY_REVIEW_MODAL_ID,
} from "../commands/devtools/devtoolsView.js";
import {
  handleCodeReviewSubmit,
  handleDebugHintButton,
  handleDebugSubmit,
  handleSecurityFixButton,
  handleSecurityReviewSubmit,
} from "../interactions/devtoolsInteractions.js";
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

      const trustHandlers: Record<string, (i: ButtonInteraction) => Promise<void>> = {
        [TRUST_START_CUSTOM_ID.execute]: handleTrustExecute,
        [TRUST_START_CUSTOM_ID.verify]: handleTrustVerify,
        [TRUST_START_CUSTOM_ID.ignore]: handleTrustIgnore,
        [TRUST_VERIFY_CUSTOM_ID.refuse]: handleTrustVerifyRefuse,
        [TRUST_VERIFY_CUSTOM_ID.executeAnyway]: handleTrustVerifyExecuteAnyway,
        [TRUST_RESTART_CUSTOM_ID]: handleTrustRestart,
      };

      const trustHandler = trustHandlers[interaction.customId];
      if (trustHandler) {
        await runWithGuards(interaction, interaction.customId, () => trustHandler(interaction));
        return;
      }

      if (interaction.customId.startsWith("devtools:fix:")) {
        const reviewId = interaction.customId.slice("devtools:fix:".length);
        await runWithGuards(interaction, interaction.customId, () =>
          handleSecurityFixButton(interaction, reviewId),
        );
        return;
      }

      if (interaction.customId.startsWith("devtools:debughint:")) {
        const debugId = interaction.customId.slice("devtools:debughint:".length);
        await runWithGuards(interaction, interaction.customId, () =>
          handleDebugHintButton(interaction, debugId),
        );
        return;
      }

      const academyAction = parseAcademyCustomId(interaction.customId);
      if (academyAction) {
        await runWithGuards(interaction, interaction.customId, async () => {
          switch (academyAction.type) {
            case "list":
              return handleListButton(interaction);
            case "start":
              return handleStartCourse(interaction, academyAction.courseKey);
            case "begin-quiz":
              return handleBeginQuiz(interaction, academyAction.lessonId);
            case "next-question":
              return handleNextQuestion(
                interaction,
                academyAction.lessonId,
                academyAction.questionOrder,
                academyAction.runningCorrect,
              );
            case "answer":
              return handleAnswer(
                interaction,
                academyAction.lessonId,
                academyAction.questionOrder,
                academyAction.runningCorrect,
                academyAction.choiceIndex,
              );
            case "finish":
              return handleFinishLesson(
                interaction,
                academyAction.lessonId,
                academyAction.score,
                academyAction.totalQuestions,
              );
            case "restart":
              return handleRestartLesson(interaction, academyAction.lessonId);
          }
        });
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

      if (interaction.customId === SECURITY_REVIEW_MODAL_ID) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleSecurityReviewSubmit(interaction),
        );
        return;
      }

      if (interaction.customId === CODE_REVIEW_MODAL_ID) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleCodeReviewSubmit(interaction),
        );
        return;
      }

      if (interaction.customId === DEBUGME_MODAL_ID) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleDebugSubmit(interaction),
        );
        return;
      }

      log.warn({ customId: interaction.customId }, "Modal inconnu reçu");
    }
  },
};

export default event;
