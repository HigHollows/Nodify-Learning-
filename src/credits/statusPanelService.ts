import { ChannelType, type Client, type TextChannel } from "discord.js";
import { env } from "../config/env.js";
import { getUsageStatsSince } from "../database/repositories/aiCallRepository.js";
import { getActiveProviderName } from "../ai/aiService.js";
import {
  computeAiStatus,
  getLastNotifiedStatus,
  getStatusPanelLocation,
  getSystemConfig,
  markStatusNotified,
  saveStatusPanelLocation,
} from "./aiControlService.js";
import { creditsEnabled } from "./creditService.js";
import { buildAiIncidentEmbed, buildStatusPanelEmbed, type StatusPanelData } from "./aiStatusView.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("statusPanelService");

/**
 * Poste une alerte "AI Incident" (nouveau message, jamais une édition du
 * panneau) dans le salon de statut si le statut public a réellement changé
 * depuis la dernière notification — jamais à chaque refresh (anti-spam).
 * Au tout premier appel (aucun statut notifié encore), on enregistre l'état
 * courant sans alerter : ce n'est pas un incident, juste le point de départ.
 */
async function checkAndNotifyIncident(client: Client, channelId: string, data: StatusPanelData): Promise<void> {
  const lastNotified = await getLastNotifiedStatus();

  if (lastNotified === null) {
    await markStatusNotified(data.status);
    return;
  }
  if (lastNotified === data.status) return;

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (channel && channel.type === ChannelType.GuildText) {
    const embed = buildAiIncidentEmbed({
      previousStatus: lastNotified,
      newStatus: data.status,
      provider: data.provider,
      reason: data.config.lastErrorMessage,
      lastSuccessfulRequestAt: data.config.lastSuccessfulRequestAt,
    });
    await (channel as TextChannel).send(embed).catch((error: unknown) => {
      log.warn({ err: error, channelId }, "Échec de l'envoi de l'alerte AI Incident");
    });
  }

  await markStatusNotified(data.status);
}

async function buildCurrentPanelData(): Promise<StatusPanelData> {
  const [status, config] = await Promise.all([computeAiStatus(), getSystemConfig()]);

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const todayStats = await getUsageStatsSince(startOfDay);

  return {
    status,
    provider: getActiveProviderName(),
    config,
    creditsEnabled: creditsEnabled(),
    todayRequestCount: todayStats.requestCount,
  };
}

/**
 * (Ré)assigne le salon officiel du panneau et poste un nouveau message —
 * appelé explicitement par un admin (`/ai panel`) pour désigner où vivre le
 * panneau la première fois, ou le déplacer.
 */
export async function createOrMovePanel(client: Client, channelId: string): Promise<void> {
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) {
    throw new Error("Salon introuvable ou n'est pas un salon texte.");
  }

  const data = await buildCurrentPanelData();
  const message = await (channel as TextChannel).send(buildStatusPanelEmbed(data));
  await saveStatusPanelLocation(channelId, message.id);
  log.info({ channelId, messageId: message.id }, "Panneau de statut IA (re)créé");
}

/**
 * À appeler au démarrage ET périodiquement. Récupère le panneau existant et
 * le met à jour ; si le message (ou le salon) a été supprimé, le recrée
 * automatiquement au même endroit et sauvegarde le nouvel ID — jamais deux
 * panneaux à la fois, jamais recréé sans raison à chaque redémarrage.
 */
export async function refreshStatusPanel(client: Client): Promise<void> {
  if (!env.AI_STATUS_ENABLED) return;

  const location = await getStatusPanelLocation();
  if (!location.channelId) return; // pas encore configuré — /ai panel doit être lancé une première fois

  const data = await buildCurrentPanelData();
  await checkAndNotifyIncident(client, location.channelId, data);

  const channel = await client.channels.fetch(location.channelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) {
    log.warn({ channelId: location.channelId }, "Salon du panneau IA introuvable, abandon du refresh");
    return;
  }

  if (location.messageId) {
    const existing = await (channel as TextChannel).messages.fetch(location.messageId).catch(() => null);
    if (existing) {
      await existing.edit(buildStatusPanelEmbed(data));
      return;
    }
    log.info("Message du panneau IA introuvable (supprimé) — recréation");
  }

  const message = await (channel as TextChannel).send(buildStatusPanelEmbed(data));
  await saveStatusPanelLocation(location.channelId, message.id);
}
