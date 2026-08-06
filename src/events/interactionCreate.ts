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
import { handleThreatModelSubmit } from "../interactions/threatModelInteractions.js";
import {
  handleFollowUpButton,
  handleFollowUpModal,
  parseFollowUpButtonId,
  parseFollowUpModalId,
} from "../interactions/explainMemory.js";
import { handleAutocomplete } from "../interactions/autocompleteInteractions.js";
import { THREAT_MODEL_MODAL_ID } from "../cybersecurity/threatModelView.js";
import { handleDailyAnswer } from "../interactions/dailyQuestionInteractions.js";
import { handleBlueTeamLineChoice } from "../interactions/blueTeamInteractions.js";
import { BLUE_TEAM_CUSTOM_ID_PREFIX } from "../cybersecurity/blueTeamView.js";
import { handleCtfSubmitButton, handleCtfSubmitModal } from "../interactions/ctfInteractions.js";
import {
  CTF_SUBMIT_MODAL_ID,
  parseCtfSubmitButtonId,
} from "../cybersecurity/ctfView.js";
import {
  handleExerciseAnswerButton,
  handleExerciseSubmitButton,
  handleExerciseSubmitModal,
} from "../interactions/exerciseInteractions.js";
import {
  EXERCISE_SUBMIT_MODAL_ID,
  parseExerciseAnswerButtonId,
  parseExerciseSubmitButtonId,
} from "../practice/exerciseView.js";
import { handleGuideDmButton } from "../interactions/guideInteractions.js";
import { GUIDE_DM_BUTTON_ID } from "../community/guideView.js";
import { recordActivity } from "../services/userService.js";
import type { Event } from "../types/event.js";
import { AIUnavailableError, AppError, InsufficientCreditsError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";
import { buildAiUnavailableReply } from "../credits/aiStatusView.js";
import { buildInsufficientCreditsReply } from "../credits/creditView.js";
import {
  handleAiCostsButton,
  handleClaimDailyButton,
  handleCreditAdminSetZero,
  handleCreditsGuideButton,
  handleCreditStatsButton,
  handleHistoryPage,
  handleRewardsButton,
} from "../interactions/creditInteractions.js";
import { CREDIT_ADMIN_SET_ZERO_PREFIX } from "../commands/credits/creditAdmin.js";
import {
  handleAdminCloseAi,
  handleAdminControlCenterRefresh,
  handleAdminMaintenanceAi,
  handleAdminReasonModalSubmit,
  handleAiUsagePage,
  handleAuditLogPage,
  handleStatusPanelRefresh,
  parseReasonModalId,
} from "../interactions/aiInteractions.js";
import { CREDIT_BUTTON_IDS } from "../credits/creditView.js";

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
    // Ces deux erreurs ont un rendu dédié (embeds stylés, pas un message brut)
    // et doivent être interceptées AVANT le fallback générique AppError.
    if (error instanceof AIUnavailableError) {
      // buildAiUnavailableReply() inclut déjà IsComponentsV2 + Ephemeral (voir aiStatusView.ts).
      const payload = buildAiUnavailableReply(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => undefined);
      } else {
        await interaction.reply(payload).catch(() => undefined);
      }
      return;
    }

    if (error instanceof InsufficientCreditsError) {
      // buildInsufficientCreditsReply() inclut déjà IsComponentsV2 + Ephemeral (voir creditView.ts).
      const payload = buildInsufficientCreditsReply(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(payload).catch(() => undefined);
      } else {
        await interaction.reply(payload).catch(() => undefined);
      }
      return;
    }

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
    if (interaction.isAutocomplete()) {
      await handleAutocomplete(interaction).catch((error: unknown) => {
        log.warn({ err: error, commandName: interaction.commandName }, "Échec de l'autocomplete");
      });
      return;
    }

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

      if (interaction.customId.startsWith("daily:answer:")) {
        const [, , questionKey, choiceIndexStr] = interaction.customId.split(":");
        if (questionKey && choiceIndexStr !== undefined) {
          await runWithGuards(interaction, interaction.customId, () =>
            handleDailyAnswer(interaction, questionKey, Number(choiceIndexStr)),
          );
          return;
        }
      }

      if (interaction.customId.startsWith(BLUE_TEAM_CUSTOM_ID_PREFIX)) {
        const index = Number(interaction.customId.slice(BLUE_TEAM_CUSTOM_ID_PREFIX.length));
        await runWithGuards(interaction, interaction.customId, () =>
          handleBlueTeamLineChoice(interaction, index),
        );
        return;
      }

      const followUpContextId = parseFollowUpButtonId(interaction.customId);
      if (followUpContextId) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleFollowUpButton(interaction, followUpContextId),
        );
        return;
      }

      const ctfChallengeKey = parseCtfSubmitButtonId(interaction.customId);
      if (ctfChallengeKey) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleCtfSubmitButton(interaction, ctfChallengeKey),
        );
        return;
      }

      const exerciseAnswer = parseExerciseAnswerButtonId(interaction.customId);
      if (exerciseAnswer) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleExerciseAnswerButton(interaction, exerciseAnswer.key, exerciseAnswer.index),
        );
        return;
      }

      const exerciseSubmitKey = parseExerciseSubmitButtonId(interaction.customId);
      if (exerciseSubmitKey) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleExerciseSubmitButton(interaction, exerciseSubmitKey),
        );
        return;
      }

      if (interaction.customId === GUIDE_DM_BUTTON_ID) {
        await runWithGuards(interaction, interaction.customId, () => handleGuideDmButton(interaction));
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

      if (interaction.customId === CREDIT_BUTTON_IDS.stats) {
        await runWithGuards(interaction, interaction.customId, () => handleCreditStatsButton(interaction));
        return;
      }

      if (interaction.customId === CREDIT_BUTTON_IDS.history) {
        await runWithGuards(interaction, interaction.customId, () => handleHistoryPage(interaction, 0));
        return;
      }

      if (interaction.customId === CREDIT_BUTTON_IDS.rewards) {
        await runWithGuards(interaction, interaction.customId, () => handleRewardsButton(interaction));
        return;
      }

      if (interaction.customId === CREDIT_BUTTON_IDS.costs) {
        await runWithGuards(interaction, interaction.customId, () => handleAiCostsButton(interaction));
        return;
      }

      if (interaction.customId === CREDIT_BUTTON_IDS.daily) {
        await runWithGuards(interaction, interaction.customId, () => handleClaimDailyButton(interaction));
        return;
      }

      if (interaction.customId === "credits:guide") {
        await runWithGuards(interaction, interaction.customId, () => handleCreditsGuideButton(interaction));
        return;
      }

      if (interaction.customId.startsWith("credits:history:")) {
        // Format `credits:history:<page>:<type>` — <type> vide = pas de filtre.
        const [, , pageStr, type] = interaction.customId.split(":");
        const page = Number(pageStr);
        await runWithGuards(interaction, interaction.customId, () =>
          handleHistoryPage(interaction, page, type || undefined),
        );
        return;
      }

      if (interaction.customId === "ai:status:refresh") {
        await runWithGuards(interaction, interaction.customId, () => handleStatusPanelRefresh(interaction));
        return;
      }

      if (interaction.customId === "ai:admin:refresh") {
        await runWithGuards(interaction, interaction.customId, () => handleAdminControlCenterRefresh(interaction));
        return;
      }

      if (interaction.customId === "ai:admin:close") {
        await runWithGuards(interaction, interaction.customId, () => handleAdminCloseAi(interaction));
        return;
      }

      if (interaction.customId === "ai:admin:maintenance") {
        await runWithGuards(interaction, interaction.customId, () => handleAdminMaintenanceAi(interaction));
        return;
      }

      if (interaction.customId.startsWith(CREDIT_ADMIN_SET_ZERO_PREFIX)) {
        const targetUserId = interaction.customId.slice(CREDIT_ADMIN_SET_ZERO_PREFIX.length);
        await runWithGuards(interaction, interaction.customId, () =>
          handleCreditAdminSetZero(interaction, targetUserId),
        );
        return;
      }

      if (interaction.customId.startsWith("ai:usage:")) {
        // Format `ai:usage:<page>:<period>:<userId>:<feature>`.
        const [, , pageStr, period, userId, feature] = interaction.customId.split(":");
        await runWithGuards(interaction, interaction.customId, () =>
          handleAiUsagePage(interaction, Number(pageStr), {
            period: period ?? "",
            userId: userId ?? "",
            feature: feature ?? "",
          }),
        );
        return;
      }

      if (interaction.customId.startsWith("credits:audit:")) {
        const page = Number(interaction.customId.slice("credits:audit:".length));
        await runWithGuards(interaction, interaction.customId, () => handleAuditLogPage(interaction, page));
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

      if (interaction.customId === THREAT_MODEL_MODAL_ID) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleThreatModelSubmit(interaction),
        );
        return;
      }

      const followUpModalContextId = parseFollowUpModalId(interaction.customId);
      if (followUpModalContextId) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleFollowUpModal(interaction, followUpModalContextId),
        );
        return;
      }

      if (interaction.customId.startsWith(`${CTF_SUBMIT_MODAL_ID}:`)) {
        const challengeKey = interaction.customId.slice(`${CTF_SUBMIT_MODAL_ID}:`.length);
        await runWithGuards(interaction, interaction.customId, () =>
          handleCtfSubmitModal(interaction, challengeKey),
        );
        return;
      }

      if (interaction.customId.startsWith(`${EXERCISE_SUBMIT_MODAL_ID}:`)) {
        const exerciseKey = interaction.customId.slice(`${EXERCISE_SUBMIT_MODAL_ID}:`.length);
        await runWithGuards(interaction, interaction.customId, () =>
          handleExerciseSubmitModal(interaction, exerciseKey),
        );
        return;
      }

      const aiReasonMode = parseReasonModalId(interaction.customId);
      if (aiReasonMode) {
        await runWithGuards(interaction, interaction.customId, () =>
          handleAdminReasonModalSubmit(interaction, aiReasonMode),
        );
        return;
      }

      log.warn({ customId: interaction.customId }, "Modal inconnu reçu");
    }
  },
};

export default event;
