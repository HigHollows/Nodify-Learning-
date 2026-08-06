import { MessageFlags, type ButtonInteraction, type ChatInputCommandInteraction } from "discord.js";
import {
  buildGuideDmContent,
  buildGuideDmFailedReply,
  buildGuideDmSentReply,
} from "../community/guideView.js";
import { trySendDirectMessage } from "../utils/dm.js";

/** Partagé par `/guide` et le bouton du post public du salon hub — même flux d'envoi. */
async function sendGuideDm(user: ChatInputCommandInteraction["user"]) {
  return trySendDirectMessage(user, buildGuideDmContent());
}

export async function handleGuideCommand(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const sent = await sendGuideDm(interaction.user);
  await interaction.editReply(sent ? buildGuideDmSentReply() : buildGuideDmFailedReply());
}

export async function handleGuideDmButton(interaction: ButtonInteraction): Promise<void> {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  const sent = await sendGuideDm(interaction.user);
  await interaction.editReply(sent ? buildGuideDmSentReply() : buildGuideDmFailedReply());
}
