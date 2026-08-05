import type { ButtonInteraction } from "discord.js";
import {
  buildTrustSimulationLoss,
  buildTrustSimulationStart,
  buildTrustSimulationVerifyStep,
  buildTrustSimulationWin,
} from "../cybersecurity/trustSimulationView.js";
import { unlockAchievement } from "../services/achievementService.js";

export async function handleTrustExecute(interaction: ButtonInteraction): Promise<void> {
  await interaction.update(buildTrustSimulationLoss(false));
}

export async function handleTrustVerify(interaction: ButtonInteraction): Promise<void> {
  await interaction.update(buildTrustSimulationVerifyStep());
}

export async function handleTrustIgnore(interaction: ButtonInteraction): Promise<void> {
  await unlockAchievement(interaction.user.id, "critical-thinker");
  await interaction.update(buildTrustSimulationWin(false));
}

export async function handleTrustVerifyRefuse(interaction: ButtonInteraction): Promise<void> {
  await unlockAchievement(interaction.user.id, "critical-thinker");
  await interaction.update(buildTrustSimulationWin(true));
}

export async function handleTrustVerifyExecuteAnyway(interaction: ButtonInteraction): Promise<void> {
  await interaction.update(buildTrustSimulationLoss(true));
}

export async function handleTrustRestart(interaction: ButtonInteraction): Promise<void> {
  await interaction.update(buildTrustSimulationStart());
}
