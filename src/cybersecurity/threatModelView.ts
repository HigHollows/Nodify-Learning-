import {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export const THREAT_MODEL_MODAL_ID = "threatmodel:modal";
export const THREAT_MODEL_INPUT_ID = "description";

const EMBED_DESCRIPTION_LIMIT = 4000;

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

export function buildThreatModelReply(analysis: string) {
  const truncated =
    analysis.length > EMBED_DESCRIPTION_LIMIT
      ? `${analysis.slice(0, EMBED_DESCRIPTION_LIMIT)}\n\n*(réponse tronquée)*`
      : analysis;

  const embed = new EmbedBuilder()
    .setTitle("🧠 Threat Model")
    .setColor("Purple")
    .setDescription(truncated);

  return { embeds: [embed], components: [] };
}
