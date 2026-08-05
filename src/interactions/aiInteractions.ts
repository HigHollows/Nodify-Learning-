import {
  ActionRowBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type ModalSubmitInteraction,
} from "discord.js";
import { computeAiStatus, setAiMode } from "../credits/aiControlService.js";
import { creditsEnabled } from "../credits/creditService.js";
import { getActiveProviderName } from "../ai/aiService.js";
import { getUsageStatsSince } from "../database/repositories/aiCallRepository.js";
import { buildAdminControlCenterEmbed } from "../credits/aiStatusView.js";
import { refreshStatusPanel } from "../credits/statusPanelService.js";
import { AppError } from "../utils/errors.js";

/** Bouton "🔄 Refresh" sur le panneau public de statut IA. */
export async function handleStatusPanelRefresh(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();
  await refreshStatusPanel(interaction.client);
}

function periodSince(period: "today" | "week" | "month"): Date {
  const now = new Date();
  if (period === "today") {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  if (period === "week") return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function assertAdminPermission(hasPermission: boolean): void {
  if (!hasPermission) {
    throw new AppError("Tu n'as pas la permission d'utiliser ce bouton.");
  }
}

/** Bouton "🔄 Refresh" du Control Center admin (`/ai stats`). */
export async function handleAdminControlCenterRefresh(interaction: ButtonInteraction): Promise<void> {
  assertAdminPermission(
    interaction.inCachedGuild() && (interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false),
  );

  const [status, today, week, month] = await Promise.all([
    computeAiStatus(),
    getUsageStatsSince(periodSince("today")),
    getUsageStatsSince(periodSince("week")),
    getUsageStatsSince(periodSince("month")),
  ]);

  await interaction.update(
    buildAdminControlCenterEmbed({ status, provider: getActiveProviderName(), creditsEnabled: creditsEnabled(), today, week, month }),
  );
}

const AI_REASON_MODAL_PREFIX = "ai:admin:reasonmodal:";
const AI_REASON_INPUT_ID = "ai-reason-input";

function buildReasonModal(mode: "CLOSED" | "MAINTENANCE") {
  const title = mode === "CLOSED" ? "Fermer les services IA" : "Passer les services IA en maintenance";
  const input = new TextInputBuilder()
    .setCustomId(AI_REASON_INPUT_ID)
    .setLabel("Raison (affichée aux utilisateurs)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(300);

  return new ModalBuilder()
    .setCustomId(`${AI_REASON_MODAL_PREFIX}${mode}`)
    .setTitle(title)
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
}

export function parseReasonModalId(customId: string): "CLOSED" | "MAINTENANCE" | null {
  if (!customId.startsWith(AI_REASON_MODAL_PREFIX)) return null;
  const mode = customId.slice(AI_REASON_MODAL_PREFIX.length);
  return mode === "CLOSED" || mode === "MAINTENANCE" ? mode : null;
}

/** Bouton "🔴 Close AI" du Control Center admin — ouvre un Modal pour recueillir la raison avant d'agir. */
export async function handleAdminCloseAi(interaction: ButtonInteraction): Promise<void> {
  assertAdminPermission(
    interaction.inCachedGuild() && (interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false),
  );
  await interaction.showModal(buildReasonModal("CLOSED"));
}

/** Bouton "🔧 Maintenance" du Control Center admin — ouvre un Modal pour recueillir la raison avant d'agir. */
export async function handleAdminMaintenanceAi(interaction: ButtonInteraction): Promise<void> {
  assertAdminPermission(
    interaction.inCachedGuild() && (interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false),
  );
  await interaction.showModal(buildReasonModal("MAINTENANCE"));
}

/** Soumission du Modal de raison (fermeture ou maintenance) — met effectivement à jour le mode IA. */
export async function handleAdminReasonModalSubmit(
  interaction: ModalSubmitInteraction,
  mode: "CLOSED" | "MAINTENANCE",
): Promise<void> {
  assertAdminPermission(
    interaction.inCachedGuild() && (interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false),
  );

  const reason = interaction.fields.getTextInputValue(AI_REASON_INPUT_ID) || undefined;
  await setAiMode(mode, interaction.user.id, reason);

  const [status, today, week, month] = await Promise.all([
    computeAiStatus(),
    getUsageStatsSince(periodSince("today")),
    getUsageStatsSince(periodSince("week")),
    getUsageStatsSince(periodSince("month")),
  ]);
  const payload = buildAdminControlCenterEmbed({
    status,
    provider: getActiveProviderName(),
    creditsEnabled: creditsEnabled(),
    today,
    week,
    month,
  });

  // Le Modal a été ouvert depuis un bouton du Control Center : si ce message
  // est encore identifiable, on le met à jour directement plutôt que de
  // poster une nouvelle réponse (`isFromMessage()` narrows le type).
  if (interaction.isFromMessage()) {
    await interaction.update(payload);
  } else {
    await interaction.reply(payload);
  }
}
