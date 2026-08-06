import type { NodifyClient } from "../client.js";
import {
  listUsersAtRiskOfLosingStreak,
  markStreakReminderSent,
} from "../database/repositories/userRepository.js";
import { trySendDirectMessage } from "../utils/dm.js";
import { todayUtc, yesterdayUtc } from "../utils/date.js";
import { childLogger } from "../utils/logger.js";
import { buildStreakReminderDm } from "./streakReminderView.js";

const log = childLogger("streakReminderService");

/**
 * N'envoie le rappel qu'en fin de journée UTC — inutile (et un peu
 * pénible) de prévenir quelqu'un à 9h du matin qu'il "va perdre son
 * streak" alors qu'il a toute la journée pour agir. 20h UTC laisse
 * quelques heures de marge avant le reset de minuit.
 */
const REMINDER_START_HOUR_UTC = 20;

/**
 * Vérifie périodiquement (voir index.ts) qui a un streak actif jamais
 * prolongé aujourd'hui et le prévient en DM — idempotent (marque
 * `lastStreakReminderDate`), best-effort sur des DM fermés (n'échoue jamais
 * le check pour un utilisateur, continue les autres).
 */
export async function checkAndSendStreakReminders(client: NodifyClient): Promise<void> {
  if (new Date().getUTCHours() < REMINDER_START_HOUR_UTC) return;

  const today = todayUtc();
  const atRisk = await listUsersAtRiskOfLosingStreak(yesterdayUtc(), today);
  if (atRisk.length === 0) return;

  for (const user of atRisk) {
    try {
      const discordUser = await client.users.fetch(user.id);
      await trySendDirectMessage(discordUser, buildStreakReminderDm(user.currentStreak));
    } catch (error) {
      log.warn({ err: error, userId: user.id }, "Échec du rappel de streak (utilisateur introuvable ?)");
    } finally {
      // Marqué "envoyé" même en cas d'échec (DM fermés, utilisateur
      // introuvable) — sinon le check suivant (15min plus tard, toujours
      // après 20h UTC) retenterait en boucle jusqu'à minuit pour rien.
      await markStreakReminderSent(user.id, today);
    }
  }

  log.info({ count: atRisk.length }, "Rappels de streak envoyés");
}
