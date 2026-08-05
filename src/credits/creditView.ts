import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type InteractionReplyOptions,
} from "discord.js";
import type { InsufficientCreditsError } from "../utils/errors.js";
import { baseEmbed, EmbedColors, formatCredits, SEPARATOR, type MessageViewPayload } from "./embedTheme.js";
import type { CreditStats, SpendBudgetStatus, Wallet } from "./creditService.js";
import { listAiCosts } from "./creditCosts.js";
import type { RewardStatus } from "./rewardService.js";

export const CREDIT_BUTTON_IDS = {
  stats: "credits:open:stats",
  history: "credits:open:history",
  rewards: "credits:open:rewards",
  costs: "credits:open:costs",
  daily: "credits:claim:daily",
};

/** Réponse guidée en cas de solde insuffisant — jamais un simple message d'erreur brut. */
export function buildInsufficientCreditsReply(
  error: InsufficientCreditsError,
): InteractionReplyOptions {
  const embed = baseEmbed("⚠️ NODIFY — CRÉDITS INSUFFISANTS", EmbedColors.warning)
    .setDescription(`Il te faut ${formatCredits(error.required)} pour utiliser cette fonctionnalité.`)
    .addFields(
      { name: "Solde actuel", value: formatCredits(error.current), inline: true },
      { name: "Manquant", value: formatCredits(error.required - error.current), inline: true },
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(CREDIT_BUTTON_IDS.daily)
      .setLabel("🎁 Récompense quotidienne")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(CREDIT_BUTTON_IDS.rewards)
      .setLabel("🎁 Récompenses")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("credits:guide")
      .setLabel("📖 Guide des crédits")
      .setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

export function buildCreditsGuideReply(): InteractionReplyOptions {
  const costs = listAiCosts();

  const embed = baseEmbed("💳 NODIFY — CRÉDITS", EmbedColors.info)
    .setDescription(
      "Les crédits permettent d'utiliser certaines fonctionnalités nécessitant l'intelligence artificielle. " +
        "Ce ne sont pas une monnaie réelle et ils ne sont pas achetables.",
    )
    .addFields(
      { name: SEPARATOR, value: "🎁 Récompenses" },
      { name: "Daily / Weekly / Monthly", value: "Récompenses périodiques gratuites (voir `/daily`, `/weekly`, `/monthly`)" },
      { name: "Apprentissage", value: "Cours, quiz et défis terminés rapportent aussi des crédits" },
      { name: SEPARATOR, value: "🤖 Coûts IA" },
      ...costs.map((c) => ({ name: c.label, value: formatCredits(c.cost), inline: true })),
    );

  return { embeds: [embed], components: [] };
}

function rewardLine(label: string, status: RewardStatus): string {
  if (!status.enabled) return `${label} — désactivé`;
  return status.available ? `${label} — disponible` : `${label} — dans ${status.remainingLabel}`;
}

function spendLine(limit: number, spent: number): string {
  if (limit <= 0) return "illimité";
  return `${spent}/${limit} crédits utilisés (${Math.max(limit - spent, 0)} restants)`;
}

export interface WalletViewData {
  username: string;
  wallet: Wallet;
  monthEarned: number;
  monthSpent: number;
  learningStreak: number;
  rewards: { daily: RewardStatus; weekly: RewardStatus; monthly: RewardStatus };
  spendStatus: SpendBudgetStatus;
}

export function buildWalletReply(data: WalletViewData): InteractionReplyOptions {
  const embed = baseEmbed("💳 NODIFY — CREDIT WALLET", EmbedColors.info)
    .setDescription(`Solde et activité récente de ${data.username}.`)
    .addFields(
      { name: SEPARATOR, value: "🪙 Balance" },
      { name: "​", value: formatCredits(data.wallet.balance) },
      { name: SEPARATOR, value: "📈 Ce mois-ci" },
      { name: "Gagnés", value: `+${data.monthEarned}`, inline: true },
      { name: "Dépensés", value: `-${data.monthSpent}`, inline: true },
      { name: SEPARATOR, value: "🔥 Learning streak" },
      { name: "​", value: `${data.learningStreak} jour(s)` },
      { name: SEPARATOR, value: "🎁 Récompenses" },
      { name: "Daily", value: rewardLine("Daily", data.rewards.daily), inline: true },
      { name: "Weekly", value: rewardLine("Weekly", data.rewards.weekly), inline: true },
      { name: "Monthly", value: rewardLine("Monthly", data.rewards.monthly), inline: true },
      { name: SEPARATOR, value: "📊 Budget IA anti-abus" },
      { name: "Aujourd'hui", value: spendLine(data.spendStatus.dailyLimit, data.spendStatus.dailySpent), inline: true },
      { name: "Ce mois-ci", value: spendLine(data.spendStatus.monthlyLimit, data.spendStatus.monthlySpent), inline: true },
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.stats).setLabel("📊 Statistiques").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.history).setLabel("📜 Historique").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.rewards).setLabel("🎁 Récompenses").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.costs).setLabel("💡 Coûts").setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

export function buildStatsReply(username: string, stats: CreditStats): InteractionReplyOptions {
  const embed = baseEmbed("📊 NODIFY — CREDIT STATISTICS", EmbedColors.info)
    .setDescription(`Statistiques de ${username}.`)
    .addFields(
      { name: "Total gagné", value: `${stats.totalEarned}`, inline: true },
      { name: "Total dépensé", value: `${stats.totalSpent}`, inline: true },
      { name: "Total remboursé", value: `${stats.totalRefunded}`, inline: true },
      { name: SEPARATOR, value: "🤖 Usage IA" },
      { name: "Requêtes", value: `${stats.aiRequestCount}`, inline: true },
      { name: "Plus utilisée", value: stats.mostUsedFeature ?? "—", inline: true },
      { name: SEPARATOR, value: "📅 Ce mois-ci" },
      { name: "Gagné", value: `+${stats.thisMonth.earned}`, inline: true },
      { name: "Dépensé", value: `-${stats.thisMonth.spent}`, inline: true },
    );

  return { embeds: [embed], components: [] };
}

/** `type` en dernier segment du customId (vide = pas de filtre) — ex: `credits:history:1:EARN`, `credits:history:0:`. */
export function buildHistoryPageCustomId(page: number, type?: string): string {
  return `credits:history:${page}:${type ?? ""}`;
}

export function buildHistoryReply(
  username: string,
  transactions: { amount: number; reason: string; createdAt: Date; type: string }[],
  page: number,
  totalPages: number,
  type?: string,
): MessageViewPayload {
  const embed = baseEmbed("📜 NODIFY — CREDIT HISTORY", EmbedColors.neutral).setDescription(
    type ? `Transactions de ${username} — filtre : ${type}.` : `Dernières transactions de ${username}.`,
  );

  if (transactions.length === 0) {
    embed.addFields({ name: "​", value: "Aucune transaction pour l'instant." });
  } else {
    for (const t of transactions) {
      const sign = t.amount >= 0 ? "+" : "";
      embed.addFields({
        name: `${sign}${t.amount} — ${t.reason}`,
        value: `<t:${Math.floor(t.createdAt.getTime() / 1000)}:R>`,
      });
    }
  }

  embed.setFooter({ text: `Page ${page + 1}/${Math.max(totalPages, 1)}` });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(buildHistoryPageCustomId(page - 1, type))
      .setLabel("◀️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 0),
    new ButtonBuilder()
      .setCustomId(buildHistoryPageCustomId(page + 1, type))
      .setLabel("▶️")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page + 1 >= totalPages),
  );

  return { embeds: [embed], components: [row] };
}

export function buildAiCostsReply(): InteractionReplyOptions {
  const costs = listAiCosts();
  const embed = baseEmbed("🤖 NODIFY — AI COSTS", EmbedColors.neutral)
    .setDescription("Coût en crédits de chaque fonctionnalité IA.")
    .addFields(costs.map((c) => ({ name: c.label, value: formatCredits(c.cost), inline: true })));

  return { embeds: [embed], components: [] };
}

const REWARD_LABELS: Record<string, string> = { DAILY: "DAILY REWARD", WEEKLY: "WEEKLY REWARD", MONTHLY: "MONTHLY REWARD" };

export function buildRewardClaimedReply(
  type: string,
  amount: number,
  newBalance: number,
): InteractionReplyOptions {
  const embed = baseEmbed(`🎁 NODIFY — ${REWARD_LABELS[type] ?? type}`, EmbedColors.operational)
    .setDescription("Ta récompense est prête.")
    .addFields(
      { name: "​", value: `+${amount} crédits` },
      { name: "Nouveau solde", value: formatCredits(newBalance) },
      { name: SEPARATOR, value: "Reviens à la prochaine période pour une nouvelle récompense." },
    );

  return { embeds: [embed], components: [] };
}

export function buildRewardCooldownReply(type: string, remainingLabel: string): InteractionReplyOptions {
  const embed = baseEmbed(`🎁 NODIFY — ${REWARD_LABELS[type] ?? type}`, EmbedColors.neutral)
    .setDescription("Tu as déjà récupéré cette récompense pour cette période.")
    .addFields({ name: "Prochaine récompense", value: `dans ${remainingLabel}` });

  return { embeds: [embed], components: [] };
}

export function buildRewardDisabledReply(type: string): InteractionReplyOptions {
  const embed = baseEmbed(`🎁 NODIFY — ${REWARD_LABELS[type] ?? type}`, EmbedColors.neutral).setDescription(
    "Cette récompense est désactivée sur Nodify pour l'instant.",
  );
  return { embeds: [embed], components: [] };
}
