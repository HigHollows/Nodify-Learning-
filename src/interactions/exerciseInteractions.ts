import type { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { submitMcqAnswer, submitTextAnswer } from "../practice/exerciseService.js";
import {
  buildExerciseResultReply,
  buildExerciseSubmitModal,
  EXERCISE_ANSWER_INPUT_ID,
} from "../practice/exerciseView.js";
import { AppError } from "../utils/errors.js";

export async function handleExerciseAnswerButton(
  interaction: ButtonInteraction,
  exerciseKey: string,
  choiceIndex: number,
): Promise<void> {
  const result = await submitMcqAnswer(interaction.user.id, exerciseKey, choiceIndex);
  if (!result) {
    throw new AppError("Cet exercice n'existe plus.");
  }
  await interaction.reply(buildExerciseResultReply(result));
}

export async function handleExerciseSubmitButton(
  interaction: ButtonInteraction,
  exerciseKey: string,
): Promise<void> {
  await interaction.showModal(buildExerciseSubmitModal(exerciseKey));
}

export async function handleExerciseSubmitModal(
  interaction: ModalSubmitInteraction,
  exerciseKey: string,
): Promise<void> {
  const answer = interaction.fields.getTextInputValue(EXERCISE_ANSWER_INPUT_ID);
  const result = await submitTextAnswer(interaction.user.id, exerciseKey, answer);
  if (!result) {
    throw new AppError("Cet exercice n'existe plus.");
  }
  await interaction.reply(buildExerciseResultReply(result));
}
