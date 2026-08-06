import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { creditsEnabled } from "../../credits/creditService.js";
import { getCreditCost } from "../../credits/creditCosts.js";
import { baseContainer, containerPayload, textDisplay, type ContainerPayload } from "../../ui/container.js";

export const SECURITY_REVIEW_MODAL_ID = "devtools:securityreview_modal";
export const CODE_REVIEW_MODAL_ID = "devtools:codereview_modal";
export const DEBUGME_MODAL_ID = "devtools:debugme_modal";

export const CODE_INPUT_ID = "code";
export const ERROR_INPUT_ID = "error";

// Couleurs identiques aux anciennes couleurs nommées discord.js (Colors.Red/Green/Blue/Orange).
const COLOR_RED = 0xed4245;
const COLOR_GREEN = 0x57f287;
const COLOR_BLUE = 0x3498db;
const COLOR_ORANGE = 0xe67e22;

/** Contenu d'un TextDisplay limité à 4000 caractères — on tronque plutôt que de planter. */
const TEXT_DISPLAY_LIMIT = 4000;

function truncate(text: string): string {
  return text.length > TEXT_DISPLAY_LIMIT
    ? `${text.slice(0, TEXT_DISPLAY_LIMIT)}\n\n*(réponse tronquée)*`
    : text;
}

/**
 * Suffixe de coût sur un bouton de suivi (relance un appel IA, donc reconsomme
 * des crédits) — sans ça, l'utilisateur découvrait le coût seulement en cas
 * de solde insuffisant après avoir cliqué. Vide si les crédits sont
 * désactivés : pas la peine d'afficher un coût qui n'est jamais vérifié.
 */
function costLabel(feature: string): string {
  if (!creditsEnabled()) return "";
  return ` (${getCreditCost(feature)} crédit${getCreditCost(feature) > 1 ? "s" : ""})`;
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

export function buildSecurityReviewReply(findings: string, reviewId: string): ContainerPayload {
  const container = baseContainer("🔒 Security Review", COLOR_RED).addTextDisplayComponents(textDisplay(truncate(findings)));

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`devtools:fix:${reviewId}`)
        .setLabel(`🔧 Voir une correction suggérée${costLabel("securityreview")}`)
        .setStyle(ButtonStyle.Primary),
    ),
  );

  return containerPayload(container);
}

export function buildCodeFixReply(fix: string): ContainerPayload {
  return containerPayload(baseContainer("🔧 Correction suggérée", COLOR_GREEN).addTextDisplayComponents(textDisplay(truncate(fix))));
}

export function buildCodeReviewReply(feedback: string): ContainerPayload {
  return containerPayload(baseContainer("🧹 Code Review", COLOR_BLUE).addTextDisplayComponents(textDisplay(truncate(feedback))));
}

export function buildDebugGuideReply(guidance: string, debugId: string): ContainerPayload {
  const container = baseContainer("🐛 Debug Coach", COLOR_ORANGE).addTextDisplayComponents(
    textDisplay(truncate(guidance)),
    textDisplay("-# Réfléchis avant de redemander un indice — le but est de comprendre, pas d'avoir la réponse toute cuite."),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`devtools:debughint:${debugId}`)
        .setLabel(`💡 Encore un indice${costLabel("debugme")}`)
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return containerPayload(container);
}

export function buildDebugHintReply(hint: string): ContainerPayload {
  return containerPayload(
    baseContainer("🐛 Debug Coach — indice supplémentaire", COLOR_ORANGE).addTextDisplayComponents(textDisplay(truncate(hint))),
  );
}

// --- Confirmation/erreur dans le salon d'origine — tout le reste (code,
// analyse, corrections) part en DM pour ne jamais encombrer le salon ni y
// exposer le code de l'utilisateur. ---

export function buildDmSentReply(): ContainerPayload {
  return containerPayload(
    baseContainer("✅ Vérifie tes messages privés", COLOR_GREEN).addTextDisplayComponents(
      textDisplay("Je t'ai envoyé un message privé pour la suite — résultat, corrections et questions se passent là-bas."),
    ),
  );
}

export function buildDmFailedReply(): ContainerPayload {
  return containerPayload(
    baseContainer("❌ Impossible de t'envoyer un message privé", COLOR_RED).addTextDisplayComponents(
      textDisplay(
        "Active tes messages privés pour ce serveur (Paramètres de confidentialité du serveur → " +
          "Autoriser les messages privés des membres du serveur), puis relance la commande.",
      ),
    ),
  );
}
