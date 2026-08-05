import {
  ActionRowBuilder,
  ModalBuilder,
  PermissionFlagsBits,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
  type ModalSubmitInteraction,
} from "discord.js";
import { setAiMode } from "../credits/aiControlService.js";
import { getAdminControlCenterData, getAiUsagePage } from "../credits/aiAdminService.js";
import { buildAdminControlCenterEmbed, buildAiUsageReply, type AiUsageFilters } from "../credits/aiStatusView.js";
import { getAuditLogPage } from "../credits/auditService.js";
import { AUDIT_LOG_PAGE_SIZE, buildAuditLogReply } from "../credits/auditView.js";
import { refreshStatusPanel } from "../credits/statusPanelService.js";
import { AppError } from "../utils/errors.js";

/** Bouton "🔄 Refresh" sur le panneau public de statut IA. */
export async function handleStatusPanelRefresh(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferUpdate();
  await refreshStatusPanel(interaction.client);
}

function assertAdminPermission(hasPermission: boolean): void {
  if (!hasPermission) {
    throw new AppError("Tu n'as pas la permission d'utiliser ce bouton.");
  }
}

function isGuildAdmin(interaction: ButtonInteraction | ModalSubmitInteraction): boolean {
  return interaction.inCachedGuild() && (interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false);
}

/** Bouton "🔄 Refresh" du Control Center admin (`/ai stats`). */
export async function handleAdminControlCenterRefresh(interaction: ButtonInteraction): Promise<void> {
  assertAdminPermission(isGuildAdmin(interaction));
  await interaction.update(buildAdminControlCenterEmbed(await getAdminControlCenterData()));
}

/** Pagination de `/ai usage` — customId `ai:usage:<page>:<period>:<userId>:<feature>`. */
export async function handleAiUsagePage(interaction: ButtonInteraction, page: number, filters: AiUsageFilters): Promise<void> {
  assertAdminPermission(isGuildAdmin(interaction));
  const safePage = Math.max(page, 0);
  await interaction.update(buildAiUsageReply(await getAiUsagePage(safePage, filters)));
}

/** Pagination de `/ai audit-log` — customId `credits:audit:<page>`. */
export async function handleAuditLogPage(interaction: ButtonInteraction, page: number): Promise<void> {
  assertAdminPermission(isGuildAdmin(interaction));
  const safePage = Math.max(page, 0);
  const data = await getAuditLogPage(AUDIT_LOG_PAGE_SIZE, safePage * AUDIT_LOG_PAGE_SIZE);
  await interaction.update(buildAuditLogReply(data, safePage));
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
  assertAdminPermission(isGuildAdmin(interaction));
  await interaction.showModal(buildReasonModal("CLOSED"));
}

/** Bouton "🔧 Maintenance" du Control Center admin — ouvre un Modal pour recueillir la raison avant d'agir. */
export async function handleAdminMaintenanceAi(interaction: ButtonInteraction): Promise<void> {
  assertAdminPermission(isGuildAdmin(interaction));
  await interaction.showModal(buildReasonModal("MAINTENANCE"));
}

/** Soumission du Modal de raison (fermeture ou maintenance) — met effectivement à jour le mode IA. */
export async function handleAdminReasonModalSubmit(
  interaction: ModalSubmitInteraction,
  mode: "CLOSED" | "MAINTENANCE",
): Promise<void> {
  assertAdminPermission(isGuildAdmin(interaction));

  const reason = interaction.fields.getTextInputValue(AI_REASON_INPUT_ID) || undefined;
  await setAiMode(mode, interaction.user.id, reason);

  const payload = buildAdminControlCenterEmbed(await getAdminControlCenterData());

  // Le Modal a été ouvert depuis un bouton du Control Center : si ce message
  // est encore identifiable, on le met à jour directement plutôt que de
  // poster une nouvelle réponse (`isFromMessage()` narrows le type).
  if (interaction.isFromMessage()) {
    await interaction.update(payload);
  } else {
    await interaction.reply(payload);
  }
}
