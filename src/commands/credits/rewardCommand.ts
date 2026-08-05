import {
  buildRewardClaimedReply,
  buildRewardCooldownReply,
  buildRewardDisabledReply,
} from "../../credits/creditView.js";
import { claimReward } from "../../credits/rewardService.js";
import type { RewardType } from "../../credits/creditTypes.js";
import { AppError } from "../../utils/errors.js";
import type { Command } from "../../types/command.js";
import { SlashCommandBuilder } from "discord.js";

/**
 * Implémentation partagée par /daily, /weekly, /monthly — même Reward
 * Engine générique (src/credits/rewardService.ts), seul le type change.
 */
export function createRewardCommand(name: string, description: string, type: RewardType): Command {
  return {
    data: new SlashCommandBuilder().setName(name).setDescription(description),

    async execute(interaction) {
      let result;
      try {
        result = await claimReward(interaction.user.id, interaction.guildId ?? undefined, type);
      } catch (error) {
        if (error instanceof AppError) {
          await interaction.reply(buildRewardDisabledReply(type));
          return;
        }
        throw error;
      }

      if (!result.claimed) {
        await interaction.reply(buildRewardCooldownReply(type, result.remainingLabel));
        return;
      }

      await interaction.reply(buildRewardClaimedReply(type, result.amount, result.newBalance));
    },
  };
}
