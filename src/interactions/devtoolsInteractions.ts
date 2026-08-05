import { randomUUID } from "node:crypto";
import type { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import {
  debugGuide,
  debugHint,
  reviewCodeQuality,
  reviewCodeSecurity,
  suggestCodeFix,
} from "../ai/aiService.js";
import {
  buildCodeFixReply,
  buildCodeReviewReply,
  buildDebugGuideReply,
  buildDebugHintReply,
  buildSecurityReviewReply,
  CODE_INPUT_ID,
  ERROR_INPUT_ID,
} from "../commands/devtools/devtoolsView.js";
import { AppError } from "../utils/errors.js";

/**
 * Le code/les échanges à reprendre sur un bouton de suivi (ex: "Voir la
 * correction", "Encore un indice") sont trop longs pour tenir dans un
 * customId Discord (limite 100 caractères) — contrairement au quiz Academy
 * dont l'état tenait dans quelques nombres. On garde donc ce contexte en
 * mémoire, avec une expiration courte : perdre ces données à un redémarrage
 * du bot n'a aucune conséquence (l'utilisateur relance juste la commande).
 */
const TTL_MS = 10 * 60 * 1000;

interface SecurityReviewContext {
  code: string;
  findings: string;
  expiresAt: number;
}

interface DebugContext {
  errorMessage: string;
  code: string | undefined;
  lastGuidance: string;
  expiresAt: number;
}

const pendingReviews = new Map<string, SecurityReviewContext>();
const pendingDebugSessions = new Map<string, DebugContext>();

function cleanupExpired<T extends { expiresAt: number }>(store: Map<string, T>): void {
  const now = Date.now();
  for (const [id, entry] of store) {
    if (entry.expiresAt < now) store.delete(id);
  }
}

function storeContext<T extends { expiresAt: number }>(
  store: Map<string, Omit<T, "expiresAt">>,
  data: Omit<T, "expiresAt">,
): string {
  cleanupExpired(store as Map<string, T>);
  const id = randomUUID().slice(0, 8);
  (store as Map<string, T>).set(id, { ...data, expiresAt: Date.now() + TTL_MS } as T);
  return id;
}

// --- Security Review --------------------------------------------------------

export async function handleSecurityReviewSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const code = interaction.fields.getTextInputValue(CODE_INPUT_ID);
  await interaction.deferReply();

  const findings = await reviewCodeSecurity(code);
  const reviewId = storeContext(pendingReviews, { code, findings });

  await interaction.editReply(buildSecurityReviewReply(findings, reviewId));
}

export async function handleSecurityFixButton(
  interaction: ButtonInteraction,
  reviewId: string,
): Promise<void> {
  cleanupExpired(pendingReviews);
  const context = pendingReviews.get(reviewId);
  if (!context) {
    throw new AppError(
      "Cette review a expiré — relance `/securityreview` pour en refaire une.",
    );
  }

  await interaction.deferUpdate();
  const fix = await suggestCodeFix(context.code, context.findings);
  await interaction.editReply(buildCodeFixReply(fix));
}

// --- Code Review (qualité) --------------------------------------------------

export async function handleCodeReviewSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const code = interaction.fields.getTextInputValue(CODE_INPUT_ID);
  await interaction.deferReply();

  const feedback = await reviewCodeQuality(code);
  await interaction.editReply(buildCodeReviewReply(feedback));
}

// --- Debug Coach -------------------------------------------------------------

export async function handleDebugSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const errorMessage = interaction.fields.getTextInputValue(ERROR_INPUT_ID);
  const code = interaction.fields.getTextInputValue(CODE_INPUT_ID) || undefined;
  await interaction.deferReply();

  const guidance = await debugGuide(errorMessage, code);
  const debugId = storeContext(pendingDebugSessions, {
    errorMessage,
    code,
    lastGuidance: guidance,
  });

  await interaction.editReply(buildDebugGuideReply(guidance, debugId));
}

export async function handleDebugHintButton(
  interaction: ButtonInteraction,
  debugId: string,
): Promise<void> {
  cleanupExpired(pendingDebugSessions);
  const context = pendingDebugSessions.get(debugId);
  if (!context) {
    throw new AppError("Cette session de debug a expiré — relance `/debugme` pour recommencer.");
  }

  await interaction.deferUpdate();
  const hint = await debugHint(context.errorMessage, context.code, context.lastGuidance);
  await interaction.editReply(buildDebugHintReply(hint));
}
