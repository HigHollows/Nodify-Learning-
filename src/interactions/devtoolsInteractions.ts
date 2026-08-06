import { randomUUID } from "node:crypto";
import { MessageFlags, type ButtonInteraction, type ModalSubmitInteraction } from "discord.js";
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
  buildDmFailedReply,
  buildDmSentReply,
  buildSecurityReviewReply,
  CODE_INPUT_ID,
  ERROR_INPUT_ID,
} from "../commands/devtools/devtoolsView.js";
import { trySendDirectMessage } from "../utils/dm.js";
import { AppError } from "../utils/errors.js";

/**
 * Dev Tools (Security Review / Code Review / Debug Coach) — toute la partie
 * personnelle (code collé, analyse, corrections, indices) se déroule en DM,
 * pour ne jamais encombrer le salon ni y exposer publiquement le code d'un
 * membre. Seul le déclenchement (`/securityreview` etc., qui ouvre un Modal
 * — invisible dans le salon, aucun message posté) reste dans le salon ; la
 * réponse à la SOUMISSION du modal est un court accusé éphémère
 * ("va voir tes DMs" / erreur si DMs fermés), jamais le contenu lui-même.
 * Les boutons de suivi ("Voir la correction", "Encore un indice") sont
 * cliqués depuis le DM et y répondent naturellement — même code, aucune
 * logique DM supplémentaire nécessaire pour eux.
 */

/**
 * Le code/les échanges à reprendre sur un bouton de suivi (ex: "Voir la
 * correction", "Encore un indice") sont trop longs pour tenir dans un
 * customId Discord (limite 100 caractères) — contrairement au quiz Academy
 * dont l'état tenait dans quelques nombres. On garde donc ce contexte en
 * mémoire, avec une expiration courte : perdre ces données à un redémarrage
 * du bot n'a aucune conséquence (l'utilisateur relance juste la commande).
 * Clé = id aléatoire court, jamais l'userId : aucun risque de mélanger deux
 * sessions même si deux membres soumettent en même temps.
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
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const findings = await reviewCodeSecurity(interaction.user.id, code, interaction.guildId ?? undefined);
  const reviewId = storeContext(pendingReviews, { code, findings });

  const sent = await trySendDirectMessage(interaction.user, buildSecurityReviewReply(findings, reviewId));
  await interaction.editReply(sent ? buildDmSentReply() : buildDmFailedReply());
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
  const fix = await suggestCodeFix(interaction.user.id, context.code, context.findings, interaction.guildId ?? undefined);
  await interaction.editReply(buildCodeFixReply(fix));
}

// --- Code Review (qualité) --------------------------------------------------

export async function handleCodeReviewSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const code = interaction.fields.getTextInputValue(CODE_INPUT_ID);
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const feedback = await reviewCodeQuality(interaction.user.id, code, interaction.guildId ?? undefined);

  const sent = await trySendDirectMessage(interaction.user, buildCodeReviewReply(feedback));
  await interaction.editReply(sent ? buildDmSentReply() : buildDmFailedReply());
}

// --- Debug Coach -------------------------------------------------------------

export async function handleDebugSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const errorMessage = interaction.fields.getTextInputValue(ERROR_INPUT_ID);
  const code = interaction.fields.getTextInputValue(CODE_INPUT_ID) || undefined;
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const guidance = await debugGuide(interaction.user.id, errorMessage, code, interaction.guildId ?? undefined);
  const debugId = storeContext(pendingDebugSessions, {
    errorMessage,
    code,
    lastGuidance: guidance,
  });

  const sent = await trySendDirectMessage(interaction.user, buildDebugGuideReply(guidance, debugId));
  await interaction.editReply(sent ? buildDmSentReply() : buildDmFailedReply());
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
  const hint = await debugHint(
    interaction.user.id,
    context.errorMessage,
    context.code,
    context.lastGuidance,
    interaction.guildId ?? undefined,
  );
  await interaction.editReply(buildDebugHintReply(hint));
}
