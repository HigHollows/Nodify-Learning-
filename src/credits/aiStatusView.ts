import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { AIUnavailableError } from "../utils/errors.js";
import {
  baseContainer,
  containerPayload,
  EmbedColors,
  ephemeralContainerPayload,
  fieldText,
  messageViewPayload,
  textDisplay,
  thinSeparator,
  type ContainerPayload,
  type EphemeralContainerPayload,
  type MessageViewPayload,
} from "../ui/container.js";
import type { AIStatus } from "./creditTypes.js";
import type { SystemConfigView } from "./aiControlService.js";
import type { AICallSummary, UsageStats } from "../database/repositories/aiCallRepository.js";
import { getFeatureLabel } from "./creditCosts.js";

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
 * concernée, pas le reste de Nodify. Toujours éphémère (erreur personnelle).
 */
export function buildAiUnavailableReply(error: AIUnavailableError): EphemeralContainerPayload {
  if (error.mode === "CLOSED") {
    const container = baseContainer("🔴 NODIFY — AI STATUS", EmbedColors.critical).addTextDisplayComponents(
      textDisplay("Nodify AI est temporairement indisponible."),
      textDisplay(fieldText("Status", "Offline")),
      textDisplay(fieldText("Raison", "Les services IA ont été temporairement désactivés.")),
    );
    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(textDisplay("Les autres fonctionnalités de Nodify restent opérationnelles."));
    return ephemeralContainerPayload(container);
  }

  if (error.mode === "MAINTENANCE") {
    const container = baseContainer("🔧 NODIFY — AI MAINTENANCE", EmbedColors.warning).addTextDisplayComponents(
      textDisplay("Nodify AI est actuellement en maintenance."),
    );
    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(textDisplay("Les autres fonctionnalités de Nodify restent opérationnelles."));
    return ephemeralContainerPayload(container);
  }

  const container = baseContainer("🟠 NODIFY — AI LIMITED", EmbedColors.warning).addTextDisplayComponents(
    textDisplay(error.userMessage),
  );
  return ephemeralContainerPayload(container);
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
  const container = baseContainer("🤖 NODIFY — AI STATUS", STATUS_COLOR[data.status]).addTextDisplayComponents(
    textDisplay("Nodify AI services and availability."),
    textDisplay(
      [
        fieldText(`${STATUS_ICON[data.status]} Status`, STATUS_LABEL[data.status]),
        fieldText("🧠 Provider", data.provider),
      ].join("\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**📊 Today's usage**"),
    textDisplay(
      [
        fieldText("Requests", `${data.todayRequestCount}`),
        fieldText("🪙 Credit system", data.creditsEnabled ? "Enabled" : "Disabled"),
      ].join("\n"),
    ),
  );

  if (data.config.aiMode === "MAINTENANCE" && data.config.maintenanceReason) {
    container.addTextDisplayComponents(textDisplay(fieldText("Reason", data.config.maintenanceReason)));
  }

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(textDisplay(`-# Last update — ${new Date().toISOString().slice(11, 16)} UTC`));

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ai:status:refresh").setLabel("🔄 Refresh").setStyle(ButtonStyle.Secondary),
  );
  container.addActionRowComponents(row);

  return messageViewPayload(container);
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
  const container = baseContainer("🤖 NODIFY — AI CONTROL CENTER", STATUS_COLOR[data.status]).addTextDisplayComponents(
    textDisplay(
      [
        fieldText(`${STATUS_ICON[data.status]} Status`, STATUS_LABEL[data.status]),
        fieldText("🧠 Provider", data.provider),
        fieldText("💳 Credits", data.creditsEnabled ? "Enabled" : "Disabled"),
      ].join("\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**📊 Today**"),
    textDisplay(
      [fieldText("Requests", `${data.today.requestCount}`), fieldText("Credits spent", `${data.today.creditsSpent}`)].join(
        "\n",
      ),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**📅 This week**"),
    textDisplay(
      [fieldText("Requests", `${data.week.requestCount}`), fieldText("Credits spent", `${data.week.creditsSpent}`)].join(
        "\n",
      ),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**🗓️ This month**"),
    textDisplay(
      [
        fieldText("Requests", `${data.month.requestCount}`),
        fieldText("Credits spent", `${data.month.creditsSpent}`),
      ].join("\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**⚠️ Reliability (this month)**"),
    textDisplay(
      [fieldText("Errors", `${data.month.errorCount}`), fieldText("Refunded", `${data.month.refundedCount}`)].join("\n"),
    ),
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId("ai:admin:refresh").setLabel("🔄 Refresh").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ai:admin:close").setLabel("🔴 Close AI").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("ai:admin:maintenance").setLabel("🔧 Maintenance").setStyle(ButtonStyle.Secondary),
  );
  container.addActionRowComponents(row);

  return messageViewPayload(container);
}

export function buildSimpleStatusEmbed(title: string, color: number, description: string): ContainerPayload {
  return containerPayload(baseContainer(title, color).addTextDisplayComponents(textDisplay(description)));
}

export const AI_USAGE_PAGE_SIZE = 8;

export interface AiUsageFilters {
  period: string; // "" = pas de filtre, sinon "today"|"week"|"month"
  userId: string; // "" = pas de filtre
  feature: string; // "" = pas de filtre
}

/** `ai:usage:<page>:<period>:<userId>:<feature>` — segments vides = pas de filtre sur ce champ. */
export function buildAiUsagePageCustomId(page: number, filters: AiUsageFilters): string {
  return `ai:usage:${page}:${filters.period}:${filters.userId}:${filters.feature}`;
}

export interface AiUsageData {
  calls: AICallSummary[];
  total: number;
  page: number;
  filters: AiUsageFilters;
  topFeatures: { feature: string; count: number }[];
}

/** `/ai usage` — paginé (contrairement à la version d'origine plafonnée à 10 résultats sans suite). */
export function buildAiUsageReply(data: AiUsageData): MessageViewPayload {
  const totalPages = Math.max(Math.ceil(data.total / AI_USAGE_PAGE_SIZE), 1);

  const container = baseContainer("🤖 NODIFY — AI USAGE", EmbedColors.neutral).addTextDisplayComponents(
    textDisplay("**🏆 Top fonctionnalités (7 jours)**"),
    textDisplay(
      data.topFeatures.length > 0
        ? data.topFeatures.map((f) => fieldText(getFeatureLabel(f.feature), `${f.count} appel(s)`)).join("\n")
        : "Aucune donnée.",
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**📜 Appels**"),
    textDisplay(
      data.calls.length === 0
        ? "Aucun appel trouvé pour ces filtres."
        : data.calls
            .map(
              (call) =>
                `**${getFeatureLabel(call.feature)} — ${call.status}**\n<@${call.userId}> · ${call.creditCost} crédit(s) · <t:${Math.floor(call.createdAt.getTime() / 1000)}:R>`,
            )
            .join("\n\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(textDisplay(`-# Page ${data.page + 1}/${totalPages} — ${data.total} appel(s) au total`));

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildAiUsagePageCustomId(data.page - 1, data.filters))
      .setLabel("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(data.page <= 0),
    new ButtonBuilder()
      .setCustomId(buildAiUsagePageCustomId(data.page + 1, data.filters))
      .setLabel("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(data.page + 1 >= totalPages),
  );
  container.addActionRowComponents(row);

  return messageViewPayload(container);
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

  const container = baseContainer(title, color).addTextDisplayComponents(
    textDisplay(
      isRecovery ? "Les services IA sont revenus à un état opérationnel." : "Le statut des services IA vient de changer.",
    ),
    textDisplay(
      [
        fieldText("Statut précédent", `${STATUS_ICON[data.previousStatus]} ${STATUS_LABEL[data.previousStatus]}`),
        fieldText("Nouveau statut", `${STATUS_ICON[data.newStatus]} ${STATUS_LABEL[data.newStatus]}`),
        fieldText("Provider", data.provider),
      ].join("\n"),
    ),
  );

  if (data.reason && !isRecovery) {
    container.addTextDisplayComponents(textDisplay(fieldText("Raison connue", data.reason)));
  }
  if (data.lastSuccessfulRequestAt) {
    container.addTextDisplayComponents(
      textDisplay(fieldText("Dernière requête réussie", `<t:${Math.floor(data.lastSuccessfulRequestAt.getTime() / 1000)}:R>`)),
    );
  }

  return messageViewPayload(container);
}
