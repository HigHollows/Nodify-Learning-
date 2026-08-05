import { SlashCommandBuilder } from "discord.js";
import { getCreditStats, getSpendBudgetStatus, getWallet } from "../../credits/creditService.js";
import { buildWalletReply } from "../../credits/creditView.js";
import { getRewardStatus } from "../../credits/rewardService.js";
import { getProfile } from "../../services/userService.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Ton solde de crédits Nodify et ton activité récente."),

  async execute(interaction) {
    const guildId = interaction.guildId ?? undefined;

    const [wallet, stats, profile, daily, weekly, monthly, spendStatus] = await Promise.all([
      getWallet(interaction.user.id),
      getCreditStats(interaction.user.id),
      getProfile(interaction.user.id),
      getRewardStatus(interaction.user.id, "DAILY"),
      getRewardStatus(interaction.user.id, "WEEKLY"),
      getRewardStatus(interaction.user.id, "MONTHLY"),
      getSpendBudgetStatus(interaction.user.id, guildId),
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
      }),
    );
  },
};

export default command;
