import { randomUUID } from "node:crypto";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type ModalSubmitInteraction,
} from "discord.js";
import { explainFollowUp, getActiveProviderName } from "../ai/aiService.js";
import type { LevelHint } from "../ai/types.js";
import { creditsEnabled } from "../credits/creditService.js";
import { getCreditCost } from "../credits/creditCosts.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../ui/container.js";
import { AppError } from "../utils/errors.js";

const EXPLAIN_COLOR = 0x9b59b6; // Purple — inchangé par rapport à l'ancien embed

/** Le bouton relance un appel IA (`explainme`), donc reconsomme des crédits — affiché pour ne pas surprendre. */
function costLabel(): string {
  if (!creditsEnabled()) return "";
  const cost = getCreditCost("explainme");
  return ` (${cost} crédit${cost > 1 ? "s" : ""})`;
}

/**
 * Mémoire courte pour les questions de suivi sur /explainme — un seul tour
 * de contexte (terme + dernière explication), pas un historique complet.
 * En mémoire process (pas en base) : le contexte tient dans le customId
 * seulement pour un id court, le contenu réel (potentiellement long) ne
 * rentre pas dans les 100 caractères d'un customId Discord.
 */
const TTL_MS = 10 * 60 * 1000;

interface ExplainContext {
  term: string;
  lastExplanation: string;
  levelHint: LevelHint;
  expiresAt: number;
}

const contexts = new Map<string, ExplainContext>();

function cleanupExpired(): void {
  const now = Date.now();
  for (const [id, ctx] of contexts) {
    if (ctx.expiresAt < now) contexts.delete(id);
  }
}

const FOLLOWUP_BUTTON_PREFIX = "explainme:followup:";
const FOLLOWUP_MODAL_PREFIX = "explainme:followup_modal:";
const FOLLOWUP_INPUT_ID = "question";

export function storeExplainContext(
  term: string,
  lastExplanation: string,
  levelHint: LevelHint,
): string {
  cleanupExpired();
  const id = randomUUID().slice(0, 8);
  contexts.set(id, { term, lastExplanation, levelHint, expiresAt: Date.now() + TTL_MS });
  return id;
}

export function buildExplainReply(term: string, explanation: string, contextId: string): ContainerPayload {
  const container = baseContainer(`🤖 Explication : ${term}`, EXPLAIN_COLOR).addTextDisplayComponents(
    textDisplay(explanation),
  );

  container.addTextDisplayComponents(
    textDisplay(
      `-# ${
        getActiveProviderName() === "stub"
          ? "⚠️ Mode démonstration — aucune clé API IA configurée"
          : "Généré par IA — vérifie les informations critiques avant de t'y fier"
      }`,
    ),
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${FOLLOWUP_BUTTON_PREFIX}${contextId}`)
      .setLabel(`💬 Question de suivi${costLabel()}`)
      .setStyle(ButtonStyle.Secondary),
  );
  container.addActionRowComponents(row);

  return containerPayload(container);
}

export function parseFollowUpButtonId(customId: string): string | null {
  return customId.startsWith(FOLLOWUP_BUTTON_PREFIX)
    ? customId.slice(FOLLOWUP_BUTTON_PREFIX.length)
    : null;
}

export function parseFollowUpModalId(customId: string): string | null {
  return customId.startsWith(FOLLOWUP_MODAL_PREFIX)
    ? customId.slice(FOLLOWUP_MODAL_PREFIX.length)
    : null;
}

export async function handleFollowUpButton(
  interaction: ButtonInteraction,
  contextId: string,
): Promise<void> {
  cleanupExpired();
  if (!contexts.has(contextId)) {
    throw new AppError("Cette conversation a expiré — relance `/explainme` pour recommencer.");
  }

  const input = new TextInputBuilder()
    .setCustomId(FOLLOWUP_INPUT_ID)
    .setLabel("Ta question de suivi")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(500);

  const modal = new ModalBuilder()
    .setCustomId(`${FOLLOWUP_MODAL_PREFIX}${contextId}`)
    .setTitle("Question de suivi")
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));

  await interaction.showModal(modal);
}

export async function handleFollowUpModal(
  interaction: ModalSubmitInteraction,
  contextId: string,
): Promise<void> {
  cleanupExpired();
  const ctx = contexts.get(contextId);
  if (!ctx) {
    throw new AppError("Cette conversation a expiré — relance `/explainme` pour recommencer.");
  }

  const question = interaction.fields.getTextInputValue(FOLLOWUP_INPUT_ID);
  await interaction.deferReply();

  const answer = await explainFollowUp(
    interaction.user.id,
    ctx.term,
    ctx.lastExplanation,
    question,
    ctx.levelHint,
    interaction.guildId ?? undefined,
  );

  const newContextId = storeExplainContext(ctx.term, answer, ctx.levelHint);
  await interaction.editReply(buildExplainReply(ctx.term, answer, newContextId));
}
