import { PermissionFlagsBits, type ButtonInteraction } from "discord.js";
import { adminSet, getCreditStats, getSpendBudgetStatus, getTransactionHistory, getWallet } from "../credits/creditService.js";
import { HISTORY_PAGE_SIZE } from "../commands/credits/creditHistory.js";
import {
  buildAiCostsReply,
  buildCreditsGuideReply,
  buildHistoryReply,
  buildRewardClaimedReply,
  buildRewardCooldownReply,
  buildRewardDisabledReply,
  buildStatsReply,
  buildWalletReply,
} from "../credits/creditView.js";
import { baseEmbed, EmbedColors } from "../credits/embedTheme.js";
import { claimReward, getRewardStatus, type RewardStatus } from "../credits/rewardService.js";
import { getProfile } from "../services/userService.js";
import { isSupporter } from "../database/repositories/userRepository.js";
import { AppError } from "../utils/errors.js";

/** Bouton "📖 Guide des crédits" — visible depuis plusieurs embeds (wallet, insufficient credits, ...). */
export async function handleCreditsGuideButton(interaction: ButtonInteraction): Promise<void> {
  await interaction.reply(buildCreditsGuideReply());
}

/** Bouton "📊 Statistiques" du wallet. */
export async function handleCreditStatsButton(interaction: ButtonInteraction): Promise<void> {
  const stats = await getCreditStats(interaction.user.id);
  await interaction.reply(buildStatsReply(interaction.user.username, stats));
}

/** Bouton "💡 Coûts" du wallet / de l'insufficient-credits reply. */
export async function handleAiCostsButton(interaction: ButtonInteraction): Promise<void> {
  await interaction.reply(buildAiCostsReply());
}

/** Bouton "🎁 Récompenses" — résumé daily/weekly/monthly, pas de claim direct (ambigu sinon lequel). */
export async function handleRewardsButton(interaction: ButtonInteraction): Promise<void> {
  const [daily, weekly, monthly] = await Promise.all([
    getRewardStatus(interaction.user.id, "DAILY"),
    getRewardStatus(interaction.user.id, "WEEKLY"),
    getRewardStatus(interaction.user.id, "MONTHLY"),
  ]);

  const line = (label: string, status: RewardStatus) =>
    !status.enabled
      ? `${label} — désactivé`
      : status.available
        ? `${label} — disponible (\`/${label.toLowerCase()}\`)`
        : `${label} — dans ${status.remainingLabel}`;

  await interaction.reply({
    embeds: [
      baseEmbed("🎁 NODIFY — RÉCOMPENSES", EmbedColors.info).addFields(
        { name: "Daily", value: line("Daily", daily) },
        { name: "Weekly", value: line("Weekly", weekly) },
        { name: "Monthly", value: line("Monthly", monthly) },
      ),
    ],
  });
}

/** Bouton "🎁 Récompense quotidienne" (raccourci direct, ex: depuis l'embed insufficient-credits). */
export async function handleClaimDailyButton(interaction: ButtonInteraction): Promise<void> {
  let result;
  try {
    result = await claimReward(interaction.user.id, interaction.guildId ?? undefined, "DAILY");
  } catch (error) {
    if (error instanceof AppError) {
      await interaction.reply(buildRewardDisabledReply("DAILY"));
      return;
    }
    throw error;
  }

  if (!result.claimed) {
    await interaction.reply(buildRewardCooldownReply("DAILY", result.remainingLabel));
    return;
  }

  await interaction.reply(buildRewardClaimedReply("DAILY", result.amount, result.newBalance));
}

/**
 * Bouton "Mettre le solde à 0" affiché sur l'échec de `/credit-admin remove`
 * (solde insuffisant pour retirer le montant demandé) — permission
 * re-vérifiée côté serveur, pas seulement masquée dans l'UI.
 */
export async function handleCreditAdminSetZero(interaction: ButtonInteraction, targetUserId: string): Promise<void> {
  if (!interaction.inCachedGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    throw new AppError("Tu n'as pas la permission d'utiliser ce bouton.");
  }

  await adminSet(interaction.user.id, targetUserId, 0, "Solde mis à 0 (solde insuffisant pour le retrait demandé)");

  await interaction.update({
    embeds: [
      baseEmbed("💳 Solde fixé", EmbedColors.operational).addFields(
        { name: "Utilisateur", value: `<@${targetUserId}>`, inline: true },
        { name: "Nouveau solde", value: "0", inline: true },
      ),
    ],
    components: [],
  });
}

/** Pagination de l'historique — customId `credits:history:<page>:<type>` (type vide = pas de filtre). */
export async function handleHistoryPage(interaction: ButtonInteraction, page: number, type?: string): Promise<void> {
  const safePage = Math.max(page, 0);
  const { transactions, total } = await getTransactionHistory(
    interaction.user.id,
    HISTORY_PAGE_SIZE,
    safePage * HISTORY_PAGE_SIZE,
    type,
  );
  const totalPages = Math.max(Math.ceil(total / HISTORY_PAGE_SIZE), 1);

  await interaction.update(
    buildHistoryReply(interaction.user.username, transactions, safePage, totalPages, type),
  );
}

/** Bouton "◀️/▶️" et re-fetch du wallet complet, utilisé si on revient sur la vue principale plus tard. */
export async function handleWalletRefresh(interaction: ButtonInteraction): Promise<void> {
  const guildId = interaction.guildId ?? undefined;

  const [wallet, stats, profile, daily, weekly, monthly, spendStatus, supporter] = await Promise.all([
    getWallet(interaction.user.id),
    getCreditStats(interaction.user.id),
    getProfile(interaction.user.id),
    getRewardStatus(interaction.user.id, "DAILY"),
    getRewardStatus(interaction.user.id, "WEEKLY"),
    getRewardStatus(interaction.user.id, "MONTHLY"),
    getSpendBudgetStatus(interaction.user.id, guildId),
    isSupporter(interaction.user.id),
  ]);

  await interaction.reply(
    buildWalletReply({
      username: interaction.user.username,
      wallet,
      monthEarned: stats.thisMonth.earned,
      monthSpent: stats.thisMonth.spent,
      learningStreak: profile?.currentStreak ?? 0,
      rewards: { daily, weekly, monthly },
      spendStatus,
      isSupporter: supporter,
    }),
  );
}
