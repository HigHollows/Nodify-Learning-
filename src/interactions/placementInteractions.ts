import type { ButtonInteraction } from "discord.js";
import { answerPlacement } from "../placement/placementService.js";
import { buildPlacementNextReply, buildPlacementResultReply, buildPlacementStaleReply } from "../placement/placementView.js";

export async function handlePlacementAnswerButton(
  interaction: ButtonInteraction,
  questionId: number,
  choiceIndex: number,
): Promise<void> {
  const outcome = await answerPlacement(interaction.user.id, questionId, choiceIndex);

  if (outcome.done === "no-session" || outcome.done === "stale") {
    await interaction.update(buildPlacementStaleReply());
    return;
  }

  if (outcome.done === true) {
    await interaction.update(buildPlacementResultReply(outcome.result));
    return;
  }

  await interaction.update(buildPlacementNextReply(outcome.nextQuestion, outcome.progress.current, outcome.progress.total));
}
