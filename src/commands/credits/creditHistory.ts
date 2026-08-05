import { SlashCommandBuilder } from "discord.js";
import { getTransactionHistory } from "../../credits/creditService.js";
import { buildHistoryReply } from "../../credits/creditView.js";
import { TRANSACTION_TYPES } from "../../credits/creditTypes.js";
import type { Command } from "../../types/command.js";

export const HISTORY_PAGE_SIZE = 5;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("credit-history")
    .setDescription("Tes dernières transactions de crédits.")
    .addStringOption((o) =>
      o
        .setName("type")
        .setDescription("Filtrer par type de transaction")
        .addChoices(...TRANSACTION_TYPES.map((t) => ({ name: t, value: t }))),
    ),

  async execute(interaction) {
    const type = interaction.options.getString("type") ?? undefined;
    const { transactions, total } = await getTransactionHistory(interaction.user.id, HISTORY_PAGE_SIZE, 0, type);
    const totalPages = Math.ceil(total / HISTORY_PAGE_SIZE);

    await interaction.reply(
      buildHistoryReply(interaction.user.username, transactions, 0, totalPages, type),
    );
  },
};

export default command;
