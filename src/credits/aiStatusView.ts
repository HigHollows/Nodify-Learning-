import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { AIUnavailableError } from "../utils/errors.js";
import { baseEmbed, EmbedColors, SEPARATOR, type MessageViewPayload } from "./embedTheme.js";
import type { AIStatus } from "./creditTypes.js";
import type { SystemConfigView } from "./aiControlService.js";
import type { UsageStats } from "../database/repositories/aiCallRepository.js";

const STATUS_LABEL: Record<AIStatus, string> = {
  OPERATIONAL: "Operational",
  DEGRADED: "Degraded",
  LIMITED: "Limited",
  OFFLINE: "Offline",
  MAINTENANCE: "Maintenance",
  QUOTA: "Quota reached",
  ERROR: "Error",
};

const STATUS_COLOR: Record<AIStatus, number> = {
  OPERATIONAL: EmbedColors.operational,
  DEGRADED: EmbedColors.warning,
  LIMITED: EmbedColors.warning,
  OFFLINE: EmbedColors.critical,
  MAINTENANCE: EmbedColors.warning,
  QUOTA: EmbedColors.warning,
  ERROR: EmbedColors.critical,
};

const STATUS_ICON: Record<AIStatus, string> = {
  OPERATIONAL: "🟢",
  DEGRADED: "🟡",
  LIMITED: "🟠",
  OFFLINE: "🔴",
  MAINTENANCE: "🔧",
  QUOTA: "⚠️",
  ERROR: "❌",
};

/**
 * Réponse à l'utilisateur quand l'IA n'est pas disponible pour sa commande —
 * jamais un message d'erreur brut : le rendu précise que seule l'IA est
 * concernée, pas le reste de Nodify.
 */
export function buildAiUnavailableReply(error: AIUnavailableError): InteractionReplyOptions {
  if (error.mode === "CLOSED") {
    const embed = baseEmbed("🔴 NODIFY — AI STATUS", EmbedColors.critical)
      .setDescription("Nodify AI est temporairement indisponible.")
      .addFields(
        { name: "Status", value: "Offline" },
        { name: "Raison", value: "Les services IA ont été temporairement désactivés." },
        { name: SEPARATOR, value: "Les autres fonctionnalités de Nodify restent opérationnelles." },
      );
    return { embeds: [embed], components: [] };
  }

  if (error.mode === "MAINTENANCE") {
    const embed = baseEmbed("🔧 NODIFY — AI MAINTENANCE", EmbedColors.warning)
      .setDescription("Nodify AI est actuellement en maintenance.")
      .addFields({ name: SEPARATOR, value: "Les autres fonctionnalités de Nodify restent opérationnelles." });
    return { embeds: [embed], components: [] };
  }

  const embed = baseEmbed("🟠 NODIFY — AI LIMITED", EmbedColors.warning).setDescription(
    error.userMessage,
  );
  return { embeds: [embed], components: [] };
}

export interface StatusPanelData {
  status: AIStatus;
  provider: string;
  config: SystemConfigView;
  creditsEnabled: boolean;
  todayRequestCount: number;
}

/** Le panneau de statut IA persistant — un seul par serveur, jamais recréé inutilement. */
export function buildStatusPanelEmbed(data: StatusPanelData): MessageViewPayload {
  const embed = baseEmbed("🤖 NODIFY — AI STATUS", STATUS_COLOR[data.status])
    .setDescription("Nodify AI services and availability.")
    .addFields(
      { name: `${STATUS_ICON[data.status]} Status`, value: STATUS_LABEL[data.status], inline: true },
      { name: "🧠 Provider", value: data.provider, inline: true },
      { name: SEPARATOR, value: "📊 Today's usage" },
      { name: "Requests", value: `${data.todayRequestCount}`, inline: true },
      { name: "🪙 Credit system", value: data.creditsEnabled ? "Enabled" : "Disabled", inline: true },
    );

  if (data.config.aiMode === "MAINTENANCE" && data.config.maintenanceReason) {
    embed.addFields({ name: "Reason", value: data.config.maintenanceReason });
  }

  embed.setFooter({ text: `Last update — ${new Date().toISOString().slice(11, 16)} UTC` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ai:status:refresh").setLabel("🔄 Refresh").setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

export interface AdminControlCenterData {
  status: AIStatus;
  provider: string;
  creditsEnabled: boolean;
  today: UsageStats;
  week: UsageStats;
  month: UsageStats;
}

export function buildAdminControlCenterEmbed(data: AdminControlCenterData): MessageViewPayload {
  const embed = baseEmbed("🤖 NODIFY — AI CONTROL CENTER", STATUS_COLOR[data.status])
    .addFields(
      { name: `${STATUS_ICON[data.status]} Status`, value: STATUS_LABEL[data.status], inline: true },
      { name: "🧠 Provider", value: data.provider, inline: true },
      { name: "💳 Credits", value: data.creditsEnabled ? "Enabled" : "Disabled", inline: true },
      { name: SEPARATOR, value: "📊 Today" },
      { name: "Requests", value: `${data.today.requestCount}`, inline: true },
      { name: "Credits spent", value: `${data.today.creditsSpent}`, inline: true },
      { name: SEPARATOR, value: "📅 This week" },
      { name: "Requests", value: `${data.week.requestCount}`, inline: true },
      { name: "Credits spent", value: `${data.week.creditsSpent}`, inline: true },
      { name: SEPARATOR, value: "🗓️ This month" },
      { name: "Requests", value: `${data.month.requestCount}`, inline: true },
      { name: "Credits spent", value: `${data.month.creditsSpent}`, inline: true },
      { name: SEPARATOR, value: "⚠️ Reliability (this month)" },
      { name: "Errors", value: `${data.month.errorCount}`, inline: true },
      { name: "Refunded", value: `${data.month.refundedCount}`, inline: true },
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ai:admin:refresh").setLabel("🔄 Refresh").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ai:admin:close").setLabel("🔴 Close AI").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("ai:admin:maintenance").setLabel("🔧 Maintenance").setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

export function buildSimpleStatusEmbed(title: string, color: number, description: string): InteractionReplyOptions {
  return { embeds: [baseEmbed(title, color).setDescription(description)], components: [] };
}

export interface AiIncidentData {
  previousStatus: AIStatus;
  newStatus: AIStatus;
  provider: string;
  reason: string | null;
  lastSuccessfulRequestAt: Date | null;
}

/**
 * Alerte "AI Incident" — postée en NOUVEAU message (jamais une édition du
 * panneau) dans le salon de statut, uniquement quand le statut change
 * réellement (voir statusPanelService.ts). Jamais d'info sensible (pas de
 * clé API, pas de payload brut du provider) — juste provider/statut/raison.
 */
export function buildAiIncidentEmbed(data: AiIncidentData): MessageViewPayload {
  const isRecovery = data.newStatus === "OPERATIONAL";
  const title = isRecovery ? "✅ NODIFY — AI INCIDENT RESOLVED" : "⚠️ NODIFY — AI INCIDENT";
  const color = isRecovery ? EmbedColors.operational : STATUS_COLOR[data.newStatus];

  const embed = baseEmbed(title, color)
    .setDescription(
      isRecovery
        ? "Les services IA sont revenus à un état opérationnel."
        : "Le statut des services IA vient de changer.",
    )
    .addFields(
      { name: "Statut précédent", value: `${STATUS_ICON[data.previousStatus]} ${STATUS_LABEL[data.previousStatus]}`, inline: true },
      { name: "Nouveau statut", value: `${STATUS_ICON[data.newStatus]} ${STATUS_LABEL[data.newStatus]}`, inline: true },
      { name: "Provider", value: data.provider, inline: true },
    );

  if (data.reason && !isRecovery) {
    embed.addFields({ name: "Raison connue", value: data.reason });
  }
  if (data.lastSuccessfulRequestAt) {
    embed.addFields({
      name: "Dernière requête réussie",
      value: `<t:${Math.floor(data.lastSuccessfulRequestAt.getTime() / 1000)}:R>`,
    });
  }

  return { embeds: [embed], components: [] };
}
