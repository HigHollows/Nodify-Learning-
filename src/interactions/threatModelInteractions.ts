import type { ModalSubmitInteraction } from "discord.js";
import { analyzeThreatModel } from "../ai/aiService.js";
import { buildThreatModelReply, THREAT_MODEL_INPUT_ID } from "../cybersecurity/threatModelView.js";

export async function handleThreatModelSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const description = interaction.fields.getTextInputValue(THREAT_MODEL_INPUT_ID);
  await interaction.deferReply();

  const analysis = await analyzeThreatModel(interaction.user.id, description);
  await interaction.editReply(buildThreatModelReply(analysis));
}
