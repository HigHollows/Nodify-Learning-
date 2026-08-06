import type { NodifyClient } from "../client.js";
import {
  getWeeklyRecapStats,
  listUsersForWeeklyRecap,
  markWeeklyRecapSent,
} from "../database/repositories/userRepository.js";
import { trySendDirectMessage } from "../utils/dm.js";
import { currentWeekMondayUtc, daysAgoUtc } from "../utils/date.js";
import { childLogger } from "../utils/logger.js";
import { buildWeeklyRecapDm } from "./weeklyRecapView.js";

const log = childLogger("weeklyRecapService");

/** N'envoie le récap que le lundi, après un peu de marge matinale (pas à 00h01 pile). */
const RECAP_DAY_UTC = 1; // 0 = dimanche, 1 = lundi
const RECAP_START_HOUR_UTC = 9;

/**
 * Vérifie périodiquement (voir index.ts) s'il faut envoyer le récap hebdo —
 * idempotent (marque `lastWeeklyRecapDate` sur la clé du lundi courant),
 * n'envoie rien à un utilisateur totalement inactif cette semaine (un
 * récap vide n'apporte rien, autant ne pas déranger).
 */
export async function checkAndSendWeeklyRecaps(client: NodifyClient): Promise<void> {
  const now = new Date();
  if (now.getUTCDay() !== RECAP_DAY_UTC || now.getUTCHours() < RECAP_START_HOUR_UTC) return;

  const weekKey = currentWeekMondayUtc();
  const candidates = await listUsersForWeeklyRecap(weekKey);
  if (candidates.length === 0) return;

  const since = daysAgoUtc(7);
  let sent = 0;

  for (const candidate of candidates) {
    try {
      const stats = await getWeeklyRecapStats(candidate.id, since);
      const hasActivity = stats.lessonsCompleted > 0 || stats.ctfSolved > 0 || stats.exercisesSolved > 0;

      if (hasActivity) {
        const discordUser = await client.users.fetch(candidate.id);
        const wasSent = await trySendDirectMessage(discordUser, buildWeeklyRecapDm(stats));
        if (wasSent) sent++;
      }
    } catch (error) {
      log.warn({ err: error, userId: candidate.id }, "Échec du récap hebdo (utilisateur introuvable ?)");
    } finally {
      // Marqué "traité" pour cette semaine même sans activité/DM fermés —
      // sinon le check suivant (toujours lundi >= 9h UTC) retenterait en
      // boucle toute la journée pour rien.
      await markWeeklyRecapSent(candidate.id, weekKey);
    }
  }

  log.info({ candidates: candidates.length, sent }, "Récaps hebdo traités");
}
