import type { ButtonInteraction } from "discord.js";
import { buildBlueTeamResult, isCorrectBlueTeamLine } from "../cybersecurity/blueTeamView.js";
import { unlockAchievement } from "../services/achievementService.js";

export async function handleBlueTeamLineChoice(
  interaction: ButtonInteraction,
  chosenIndex: number,
): Promise<void> {
  if (isCorrectBlueTeamLine(chosenIndex)) {
    await unlockAchievement(interaction.user.id, "blue-team-analyst");
  }
  await interaction.update(buildBlueTeamResult(chosenIndex));
}
