import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { InsufficientCreditsError } from "../utils/errors.js";
import {
  baseContainer,
  containerPayload,
  EmbedColors,
  ephemeralContainerPayload,
  fieldText,
  formatCredits,
  messageViewPayload,
  textDisplay,
  thinSeparator,
  type ContainerPayload,
  type EphemeralContainerPayload,
  type MessageViewPayload,
} from "../ui/container.js";
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

/** Réponse guidée en cas de solde insuffisant — jamais un simple message d'erreur brut. Toujours éphémère. */
export function buildInsufficientCreditsReply(error: InsufficientCreditsError): EphemeralContainerPayload {
  const container = baseContainer("⚠️ NODIFY — CRÉDITS INSUFFISANTS", EmbedColors.warning).addTextDisplayComponents(
    textDisplay(`Il te faut ${formatCredits(error.required)} pour utiliser cette fonctionnalité.`),
    textDisplay(fieldText("Solde actuel", formatCredits(error.current))),
    textDisplay(fieldText("Manquant", formatCredits(error.required - error.current))),
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
  container.addActionRowComponents(row);

  return ephemeralContainerPayload(container);
}

export function buildCreditsGuideReply(): ContainerPayload {
  const costs = listAiCosts();

  const container = baseContainer("💳 NODIFY — CRÉDITS", EmbedColors.info).addTextDisplayComponents(
    textDisplay(
      "Les crédits permettent d'utiliser certaines fonctionnalités nécessitant l'intelligence artificielle. " +
        "Ce ne sont pas une monnaie réelle et ils ne sont pas achetables.",
    ),
  );
  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**🎁 Récompenses**"),
    textDisplay("Daily / Weekly / Monthly — Récompenses périodiques gratuites (voir `/daily`, `/weekly`, `/monthly`)"),
    textDisplay("Apprentissage — Cours, quiz et défis terminés rapportent aussi des crédits"),
  );
  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**🤖 Coûts IA**"),
    textDisplay(costs.map((c) => `${c.label} — ${formatCredits(c.cost)}`).join("\n")),
  );

  return containerPayload(container);
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
  isSupporter: boolean;
}

export function buildWalletReply(data: WalletViewData): ContainerPayload {
  const container = baseContainer("💳 NODIFY — CREDIT WALLET", EmbedColors.info).addTextDisplayComponents(
    textDisplay(`Solde et activité récente de ${data.username}.${data.isSupporter ? " ⭐ Statut supporter." : ""}`),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**🪙 Balance**"),
    textDisplay(formatCredits(data.wallet.balance)),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**📈 Ce mois-ci**"),
    textDisplay(`${fieldText("Gagnés", `+${data.monthEarned}`)}\n${fieldText("Dépensés", `-${data.monthSpent}`)}`),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**🔥 Learning streak**"),
    textDisplay(`${data.learningStreak} jour(s)`),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**🎁 Récompenses**"),
    textDisplay(
      [
        fieldText("Daily", rewardLine("Daily", data.rewards.daily)),
        fieldText("Weekly", rewardLine("Weekly", data.rewards.weekly)),
        fieldText(
          "Monthly",
          `${rewardLine("Monthly", data.rewards.monthly)}${data.isSupporter ? " (+ bonus supporter ⭐)" : ""}`,
        ),
      ].join("\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**📊 Budget IA anti-abus**"),
    textDisplay(
      [
        fieldText("Aujourd'hui", spendLine(data.spendStatus.dailyLimit, data.spendStatus.dailySpent)),
        fieldText("Ce mois-ci", spendLine(data.spendStatus.monthlyLimit, data.spendStatus.monthlySpent)),
      ].join("\n"),
    ),
  );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.stats).setLabel("📊 Statistiques").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.history).setLabel("📜 Historique").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.rewards).setLabel("🎁 Récompenses").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(CREDIT_BUTTON_IDS.costs).setLabel("💡 Coûts").setStyle(ButtonStyle.Secondary),
  );
  container.addActionRowComponents(row);

  return containerPayload(container);
}

export function buildStatsReply(username: string, stats: CreditStats): ContainerPayload {
  const container = baseContainer("📊 NODIFY — CREDIT STATISTICS", EmbedColors.info).addTextDisplayComponents(
    textDisplay(`Statistiques de ${username}.`),
    textDisplay(
      [
        fieldText("Total gagné", `${stats.totalEarned}`),
        fieldText("Total dépensé", `${stats.totalSpent}`),
        fieldText("Total remboursé", `${stats.totalRefunded}`),
      ].join("\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**🤖 Usage IA**"),
    textDisplay(
      [
        fieldText("Requêtes", `${stats.aiRequestCount}`),
        fieldText("Plus utilisée", stats.mostUsedFeature ?? "—"),
      ].join("\n"),
    ),
  );

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(
    textDisplay("**📅 Ce mois-ci**"),
    textDisplay(
      [fieldText("Gagné", `+${stats.thisMonth.earned}`), fieldText("Dépensé", `-${stats.thisMonth.spent}`)].join("\n"),
    ),
  );

  return containerPayload(container);
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
  const container = baseContainer("📜 NODIFY — CREDIT HISTORY", EmbedColors.neutral).addTextDisplayComponents(
    textDisplay(type ? `Transactions de ${username} — filtre : ${type}.` : `Dernières transactions de ${username}.`),
  );

  if (transactions.length === 0) {
    container.addTextDisplayComponents(textDisplay("Aucune transaction pour l'instant."));
  } else {
    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(
      textDisplay(
        transactions
          .map((t) => {
            const sign = t.amount >= 0 ? "+" : "";
            return `**${sign}${t.amount} — ${t.reason}**\n<t:${Math.floor(t.createdAt.getTime() / 1000)}:R>`;
          })
          .join("\n\n"),
      ),
    );
  }

  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(textDisplay(`-# Page ${page + 1}/${Math.max(totalPages, 1)}`));

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
  container.addActionRowComponents(row);

  return messageViewPayload(container);
}

export function buildAiCostsReply(): ContainerPayload {
  const costs = listAiCosts();
  const container = baseContainer("🤖 NODIFY — AI COSTS", EmbedColors.neutral).addTextDisplayComponents(
    textDisplay("Coût en crédits de chaque fonctionnalité IA."),
    textDisplay(costs.map((c) => fieldText(c.label, formatCredits(c.cost))).join("\n")),
  );

  return containerPayload(container);
}

const REWARD_LABELS: Record<string, string> = { DAILY: "DAILY REWARD", WEEKLY: "WEEKLY REWARD", MONTHLY: "MONTHLY REWARD" };

export function buildRewardClaimedReply(type: string, amount: number, newBalance: number): ContainerPayload {
  const container = baseContainer(`🎁 NODIFY — ${REWARD_LABELS[type] ?? type}`, EmbedColors.operational).addTextDisplayComponents(
    textDisplay("Ta récompense est prête."),
    textDisplay(`+${amount} crédits`),
    textDisplay(fieldText("Nouveau solde", formatCredits(newBalance))),
  );
  container.addSeparatorComponents(thinSeparator());
  container.addTextDisplayComponents(textDisplay("Reviens à la prochaine période pour une nouvelle récompense."));

  return containerPayload(container);
}

export function buildRewardCooldownReply(type: string, remainingLabel: string): ContainerPayload {
  const container = baseContainer(`🎁 NODIFY — ${REWARD_LABELS[type] ?? type}`, EmbedColors.neutral).addTextDisplayComponents(
    textDisplay("Tu as déjà récupéré cette récompense pour cette période."),
    textDisplay(fieldText("Prochaine récompense", `dans ${remainingLabel}`)),
  );

  return containerPayload(container);
}

export function buildRewardDisabledReply(type: string): ContainerPayload {
  const container = baseContainer(`🎁 NODIFY — ${REWARD_LABELS[type] ?? type}`, EmbedColors.neutral).addTextDisplayComponents(
    textDisplay("Cette récompense est désactivée sur Nodify pour l'instant."),
  );
  return containerPayload(container);
}
