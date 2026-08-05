import type { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { submitFlag } from "../cybersecurity/ctfService.js";
import {
  buildCtfSubmitModal,
  buildCtfSubmitResultReply,
  CTF_FLAG_INPUT_ID,
} from "../cybersecurity/ctfView.js";
import { AppError } from "../utils/errors.js";

export async function handleCtfSubmitButton(
  interaction: ButtonInteraction,
  challengeKey: string,
): Promise<void> {
  await interaction.showModal(buildCtfSubmitModal(challengeKey));
}

export async function handleCtfSubmitModal(
  interaction: ModalSubmitInteraction,
  challengeKey: string,
): Promise<void> {
  const answer = interaction.fields.getTextInputValue(CTF_FLAG_INPUT_ID);
  const result = await submitFlag(interaction.user.id, challengeKey, answer);

  if (!result) {
    throw new AppError("Ce défi n'existe plus.");
  }

  await interaction.reply(
    buildCtfSubmitResultReply(
      result.correct,
      result.alreadySolved,
      result.points,
      result.achievementUnlocked,
    ),
  );
}
