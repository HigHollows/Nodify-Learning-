import type { ButtonInteraction } from "discord.js";
import {
  buildAlreadyAnsweredReply,
  buildDailyAnswerFeedback,
} from "../community/dailyQuestionView.js";
import { submitDailyAnswer } from "../community/dailyQuestionService.js";
import { AppError } from "../utils/errors.js";

export async function handleDailyAnswer(
  interaction: ButtonInteraction,
  questionKey: string,
  choiceIndex: number,
): Promise<void> {
  if (!interaction.guildId) {
    throw new AppError("La question du jour ne fonctionne que sur un serveur.");
  }

  const result = await submitDailyAnswer(
    interaction.user.id,
    interaction.guildId,
    questionKey,
    choiceIndex,
  );

  if (!result) {
    throw new AppError("Cette question n'existe plus.");
  }

  if (result.alreadyAnswered) {
    await interaction.reply(buildAlreadyAnsweredReply());
    return;
  }

  await interaction.reply(buildDailyAnswerFeedback(result.correct, result.explanation));
}
