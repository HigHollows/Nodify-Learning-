import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../ui/container.js";

export const THREAT_MODEL_MODAL_ID = "threatmodel:modal";
export const THREAT_MODEL_INPUT_ID = "description";

const TEXT_DISPLAY_LIMIT = 4000;
const COLOR_PURPLE = 0x9b59b6;

export function buildThreatModelModal(): ModalBuilder {
  const input = new TextInputBuilder()
    .setCustomId(THREAT_MODEL_INPUT_ID)
    .setLabel("Décris ton architecture ou ton flux")
    .setPlaceholder(
      "ex: API Node.js avec JWT, base PostgreSQL, upload de fichiers utilisateurs vers S3...",
    )
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(2000);

  return new ModalBuilder()
    .setCustomId(THREAT_MODEL_MODAL_ID)
    .setTitle("Threat Modeling")
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
}

export function buildThreatModelReply(analysis: string): ContainerPayload {
  const truncated =
    analysis.length > TEXT_DISPLAY_LIMIT ? `${analysis.slice(0, TEXT_DISPLAY_LIMIT)}\n\n*(réponse tronquée)*` : analysis;

  return containerPayload(baseContainer("🧠 Threat Model", COLOR_PURPLE).addTextDisplayComponents(textDisplay(truncated)));
}
