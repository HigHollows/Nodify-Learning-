import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export const SECURITY_REVIEW_MODAL_ID = "devtools:securityreview_modal";
export const CODE_REVIEW_MODAL_ID = "devtools:codereview_modal";
export const DEBUGME_MODAL_ID = "devtools:debugme_modal";

export const CODE_INPUT_ID = "code";
export const ERROR_INPUT_ID = "error";

/** Description Discord (embed) limitée à 4096 caractères — on tronque plutôt que de planter. */
const EMBED_DESCRIPTION_LIMIT = 4000;

function truncate(text: string): string {
  return text.length > EMBED_DESCRIPTION_LIMIT
    ? `${text.slice(0, EMBED_DESCRIPTION_LIMIT)}\n\n*(réponse tronquée)*`
    : text;
}

function buildCodeModal(customId: string, title: string): ModalBuilder {
  const input = new TextInputBuilder()
    .setCustomId(CODE_INPUT_ID)
    .setLabel("Colle ton code ici")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(4000);

  return new ModalBuilder()
    .setCustomId(customId)
    .setTitle(title)
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
}

export function buildSecurityReviewModal(): ModalBuilder {
  return buildCodeModal(SECURITY_REVIEW_MODAL_ID, "Security Review");
}

export function buildCodeReviewModal(): ModalBuilder {
  return buildCodeModal(CODE_REVIEW_MODAL_ID, "Code Review");
}

export function buildDebugModal(): ModalBuilder {
  const errorInput = new TextInputBuilder()
    .setCustomId(ERROR_INPUT_ID)
    .setLabel("Message d'erreur")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true)
    .setMaxLength(1000);

  const codeInput = new TextInputBuilder()
    .setCustomId(CODE_INPUT_ID)
    .setLabel("Code concerné (optionnel)")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false)
    .setMaxLength(3000);

  return new ModalBuilder()
    .setCustomId(DEBUGME_MODAL_ID)
    .setTitle("Debug Coach")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(errorInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput),
    );
}

export function buildSecurityReviewReply(findings: string, reviewId: string) {
  const embed = new EmbedBuilder()
    .setTitle("🔒 Security Review")
    .setColor("Red")
    .setDescription(truncate(findings));

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`devtools:fix:${reviewId}`)
      .setLabel("🔧 Voir une correction suggérée")
      .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
}

export function buildCodeFixReply(fix: string) {
  const embed = new EmbedBuilder()
    .setTitle("🔧 Correction suggérée")
    .setColor("Green")
    .setDescription(truncate(fix));

  return { embeds: [embed], components: [] };
}

export function buildCodeReviewReply(feedback: string) {
  const embed = new EmbedBuilder()
    .setTitle("🧹 Code Review")
    .setColor("Blue")
    .setDescription(truncate(feedback));

  return { embeds: [embed], components: [] };
}

export function buildDebugGuideReply(guidance: string, debugId: string) {
  const embed = new EmbedBuilder()
    .setTitle("🐛 Debug Coach")
    .setColor("Orange")
    .setDescription(truncate(guidance))
    .setFooter({ text: "Réfléchis avant de redemander un indice — le but est de comprendre, pas d'avoir la réponse toute cuite." });

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`devtools:debughint:${debugId}`)
      .setLabel("💡 Encore un indice")
      .setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

export function buildDebugHintReply(hint: string) {
  const embed = new EmbedBuilder()
    .setTitle("🐛 Debug Coach — indice supplémentaire")
    .setColor("Orange")
    .setDescription(truncate(hint));

  return { embeds: [embed], components: [] };
}
