import type { ButtonInteraction } from "discord.js";
import { findCourseByKey } from "../database/repositories/academyRepository.js";
import { findCtfChallengeByKey } from "../database/repositories/ctfRepository.js";
import { buildCourseShareMessage, buildCtfShareMessage, buildShareAckReply, buildShareFailedReply } from "../social/shareView.js";
import { AppError } from "../utils/errors.js";

export async function handleShareCourseButton(interaction: ButtonInteraction, courseKey: string): Promise<void> {
  const course = await findCourseByKey(courseKey);
  if (!course) throw new AppError("Ce cours n'existe plus.");

  if (!interaction.channel?.isTextBased() || !("send" in interaction.channel)) {
    await interaction.reply(buildShareFailedReply());
    return;
  }

  await interaction.channel.send(buildCourseShareMessage(interaction.user.username, course.title));
  await interaction.reply(buildShareAckReply());
}

export async function handleShareCtfButton(interaction: ButtonInteraction, challengeKey: string): Promise<void> {
  const challenge = await findCtfChallengeByKey(challengeKey);
  if (!challenge) throw new AppError("Ce défi n'existe plus.");

  if (!interaction.channel?.isTextBased() || !("send" in interaction.channel)) {
    await interaction.reply(buildShareFailedReply());
    return;
  }

  await interaction.channel.send(buildCtfShareMessage(interaction.user.username, challenge.title, challenge.points));
  await interaction.reply(buildShareAckReply());
}
