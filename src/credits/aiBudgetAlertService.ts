import type { NodifyClient } from "../client.js";
import { env } from "../config/env.js";
import { getGuildAiSpendSince } from "../database/repositories/creditRepository.js";
import { listAllGuildConfigs, markAiBudgetAlertSent } from "../database/repositories/guildRepository.js";
import { baseContainer, EmbedColors, messageViewPayload, textDisplay } from "../ui/container.js";
import { trySendDirectMessage } from "../utils/dm.js";
import { startOfTodayUtc, todayUtc } from "../utils/date.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("aiBudgetAlertService");

/** Seuil d'alerte : 80% du plafond configuré, pas 100% — laisse le temps à l'admin d'agir avant le blocage réel. */
const ALERT_THRESHOLD_RATIO = 0.8;

function startOfMonthUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function currentMonthKeyUtc(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

/**
 * DM au propriétaire du serveur (guild.ownerId — seul contact admin
 * toujours bien défini, contrairement à "qui a la permission ManageGuild"
 * qui peut être plusieurs personnes) quand la dépense IA agrégée de ce
 * serveur approche 80% du plafond configuré pour ce serveur (override ou
 * défaut global). Signal d'ensemble, PAS le plafond réellement appliqué
 * (qui reste par-utilisateur, voir creditService.reserveForFeature) — voir
 * le commentaire sur GuildConfig.lastAiBudgetAlertDate dans le schéma.
 */
export async function checkAndSendAiBudgetAlerts(client: NodifyClient): Promise<void> {
  const configs = await listAllGuildConfigs();
  if (configs.length === 0) return;

  const today = todayUtc();
  const monthKey = currentMonthKeyUtc();
  const startOfDay = startOfTodayUtc();
  const startOfMonth = startOfMonthUtc();

  for (const config of configs) {
    const dailyLimit = config.maxDailyAiSpend ?? env.MAX_DAILY_AI_SPEND;
    const monthlyLimit = config.maxMonthlyAiSpend ?? env.MAX_MONTHLY_AI_SPEND;
    if (dailyLimit <= 0 && monthlyLimit <= 0) continue; // pas de plafond significatif à surveiller

    try {
      const [dailySpent, monthlySpent] = await Promise.all([
        dailyLimit > 0 && config.lastAiBudgetAlertDate !== today ? getGuildAiSpendSince(config.guildId, startOfDay) : Promise.resolve(0),
        monthlyLimit > 0 && config.lastAiBudgetAlertMonth !== monthKey
          ? getGuildAiSpendSince(config.guildId, startOfMonth)
          : Promise.resolve(0),
      ]);

      const dailyNearLimit = dailyLimit > 0 && config.lastAiBudgetAlertDate !== today && dailySpent >= dailyLimit * ALERT_THRESHOLD_RATIO;
      const monthlyNearLimit =
        monthlyLimit > 0 && config.lastAiBudgetAlertMonth !== monthKey && monthlySpent >= monthlyLimit * ALERT_THRESHOLD_RATIO;

      if (!dailyNearLimit && !monthlyNearLimit) continue;

      const guild = client.guilds.cache.get(config.guildId) ?? (await client.guilds.fetch(config.guildId).catch(() => null));
      if (!guild) continue; // bot n'est plus sur cette guild

      const owner = await client.users.fetch(guild.ownerId).catch(() => null);
      if (!owner) continue;

      const lines: string[] = [];
      if (dailyNearLimit) lines.push(`**Quotidien :** ${dailySpent}/${dailyLimit} crédits (${Math.round((dailySpent / dailyLimit) * 100)}%)`);
      if (monthlyNearLimit) lines.push(`**Mensuel :** ${monthlySpent}/${monthlyLimit} crédits (${Math.round((monthlySpent / monthlyLimit) * 100)}%)`);

      const container = baseContainer(`💰 Budget IA — ${guild.name}`, EmbedColors.warning).addTextDisplayComponents(
        textDisplay(
          `La consommation IA cumulée de tous les membres approche le plafond configuré pour ce serveur.\n\n${lines.join("\n")}`,
        ),
        textDisplay("-# Ajuste le plafond avec `+ai budget` si besoin, ou laisse tel quel — ceci est juste un signal, rien n'est bloqué automatiquement."),
      );

      await trySendDirectMessage(owner, messageViewPayload(container));

      await markAiBudgetAlertSent(config.guildId, {
        ...(dailyNearLimit ? { lastAiBudgetAlertDate: today } : {}),
        ...(monthlyNearLimit ? { lastAiBudgetAlertMonth: monthKey } : {}),
      });

      log.info({ guildId: config.guildId, dailyNearLimit, monthlyNearLimit }, "Alerte budget IA envoyée");
    } catch (error) {
      log.warn({ err: error, guildId: config.guildId }, "Échec du check budget IA pour cette guild");
    }
  }
}
