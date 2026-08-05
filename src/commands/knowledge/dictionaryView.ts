import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type RepliableInteraction,
} from "discord.js";
import { resolveConcept } from "../../knowledge/conceptService.js";
import type { ConceptDetail } from "../../knowledge/conceptService.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../../types/skill.js";
import { labelForLevelOrder } from "../../utils/leveling.js";

export const DICTIONARY_SEARCH_BUTTON_ID = "dictionary:search";
export const DICTIONARY_SEARCH_MODAL_ID = "dictionary:search_modal";
export const DICTIONARY_SEARCH_MODAL_INPUT_ID = "term";

type ExplainLevel = "beginner" | "advanced";

function explainButtonCustomId(key: string, currentLevel: ExplainLevel): string {
  return `dictionary:explain:${key}:${currentLevel}`;
}

/** Parse le customId d'un bouton "Expliquer" : dictionary:explain:<key>:<level>. */
export function parseExplainCustomId(
  customId: string,
): { key: string; level: ExplainLevel } | null {
  const parts = customId.split(":");
  if (parts.length !== 4 || parts[0] !== "dictionary" || parts[1] !== "explain") return null;
  const level = parts[3];
  if (level !== "beginner" && level !== "advanced") return null;
  return { key: parts[2]!, level };
}

export function buildDictionaryHomeReply() {
  const embed = new EmbedBuilder()
    .setTitle("📖 NODIFY TECH DICTIONARY")
    .setColor("Blue")
    .setDescription(
      "Recherche un terme technique (JWT, Promise, API, DNS, XSS, Docker, RAG...).\n" +
        "Tu peux aussi taper directement `/dictionary terme:<mot>`.",
    );

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(DICTIONARY_SEARCH_BUTTON_ID)
      .setLabel("🔎 Rechercher")
      .setStyle(ButtonStyle.Primary),
  );

  return { embeds: [embed], components: [row] };
}

export function buildSearchModal(): ModalBuilder {
  const input = new TextInputBuilder()
    .setCustomId(DICTIONARY_SEARCH_MODAL_INPUT_ID)
    .setLabel("Terme technique")
    .setPlaceholder("ex: JWT, Promise, XSS...")
    .setStyle(TextInputStyle.Short)
    .setRequired(true)
    .setMaxLength(100);

  return new ModalBuilder()
    .setCustomId(DICTIONARY_SEARCH_MODAL_ID)
    .setTitle("Rechercher un terme")
    .addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
}

function buildConceptReply(concept: ConceptDetail, level: ExplainLevel) {
  const categoryLabel = SKILL_CATEGORY_LABELS[concept.category as SkillCategory] ?? concept.category;
  const explanation =
    level === "beginner" ? concept.explanationBeginner : concept.explanationAdvanced;

  const embed = new EmbedBuilder()
    .setTitle(`📖 ${concept.name}`)
    .setColor("Blue")
    .setDescription(concept.definition)
    .addFields(
      { name: "Catégorie", value: categoryLabel, inline: true },
      { name: "Niveau", value: labelForLevelOrder(concept.levelOrder), inline: true },
      {
        name: level === "beginner" ? "💡 Explication (débutant)" : "💡 Explication (avancé)",
        value: explanation,
      },
    );

  if (concept.prerequisites.length > 0) {
    embed.addFields({
      name: "📋 Prérequis",
      value: concept.prerequisites.map((p) => p.name).join(", "),
    });
  }

  if (concept.related.length > 0) {
    embed.addFields({
      name: "🔗 Concepts liés",
      value: concept.related.map((r) => r.name).join(", "),
    });
  }

  if (concept.docUrl) {
    embed.addFields({ name: "📚 Documentation", value: `[Lien officiel](${concept.docUrl})` });
  }

  const nextLevel: ExplainLevel = level === "beginner" ? "advanced" : "beginner";
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(explainButtonCustomId(concept.key, level))
      .setLabel(nextLevel === "advanced" ? "💡 Expliquer en plus avancé" : "💡 Expliquer plus simplement")
      .setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

function buildSuggestionsReply(query: string, suggestions: { key: string; name: string }[]) {
  const embed = new EmbedBuilder()
    .setTitle("📖 Aucune correspondance exacte")
    .setColor("Orange")
    .setDescription(
      `Rien d'exact pour « ${query} ». Tu voulais peut-être dire :\n` +
        suggestions.map((s) => `• **${s.name}**`).join("\n"),
    );

  return { embeds: [embed], components: [] };
}

function buildNotFoundReply(query: string) {
  const embed = new EmbedBuilder()
    .setTitle("📖 Terme introuvable")
    .setColor("Red")
    .setDescription(
      `Aucun résultat pour « ${query} ». Le dictionnaire Nodify est encore jeune — ` +
        "ce terme sera peut-être ajouté bientôt.",
    );

  return { embeds: [embed], components: [] };
}

/** Résout une recherche et répond sur n'importe quelle interaction repliable (slash, bouton, modal). */
export async function replyWithConceptSearch(
  interaction: RepliableInteraction,
  query: string,
): Promise<void> {
  const resolution = await resolveConcept(query);

  const payload =
    resolution.type === "exact"
      ? buildConceptReply(resolution.concept, "beginner")
      : resolution.type === "suggestions"
        ? buildSuggestionsReply(resolution.query, resolution.suggestions)
        : buildNotFoundReply(resolution.query);

  if (interaction.replied || interaction.deferred) {
    await interaction.editReply(payload);
  } else {
    await interaction.reply(payload);
  }
}

export { buildConceptReply };
