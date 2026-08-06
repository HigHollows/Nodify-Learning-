import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type RepliableInteraction,
} from "discord.js";
import { recordConceptView, resolveConcept } from "../../knowledge/conceptService.js";
import type { ConceptDetail } from "../../knowledge/conceptService.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../../types/skill.js";
import { labelForLevelOrder } from "../../utils/leveling.js";
import { baseContainer, containerPayload, fieldText, textDisplay, type ContainerPayload } from "../../ui/container.js";

export const DICTIONARY_SEARCH_BUTTON_ID = "dictionary:search";
export const DICTIONARY_SEARCH_MODAL_ID = "dictionary:search_modal";
export const DICTIONARY_SEARCH_MODAL_INPUT_ID = "term";

const COLOR_BLUE = 0x3498db;
const COLOR_ORANGE = 0xe67e22;
const COLOR_RED = 0xed4245;

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

export function buildDictionaryHomeReply(): ContainerPayload {
  const container = baseContainer("📖 NODIFY TECH DICTIONARY", COLOR_BLUE).addTextDisplayComponents(
    textDisplay(
      "Recherche un terme technique (JWT, Promise, API, DNS, XSS, Docker, RAG...).\n" +
        "Tu peux aussi taper directement `/dictionary terme:<mot>`.",
    ),
  );

  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(DICTIONARY_SEARCH_BUTTON_ID).setLabel("🔎 Rechercher").setStyle(ButtonStyle.Primary),
    ),
  );

  return containerPayload(container);
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

function buildConceptReply(concept: ConceptDetail, level: ExplainLevel): ContainerPayload {
  const categoryLabel = SKILL_CATEGORY_LABELS[concept.category as SkillCategory] ?? concept.category;
  const explanation = level === "beginner" ? concept.explanationBeginner : concept.explanationAdvanced;

  const container = baseContainer(`📖 ${concept.name}`, COLOR_BLUE).addTextDisplayComponents(
    textDisplay(concept.definition),
    textDisplay([fieldText("Catégorie", categoryLabel), fieldText("Niveau", labelForLevelOrder(concept.levelOrder))].join("\n")),
    textDisplay(fieldText(level === "beginner" ? "💡 Explication (débutant)" : "💡 Explication (avancé)", explanation)),
  );

  if (concept.prerequisites.length > 0) {
    container.addTextDisplayComponents(
      textDisplay(fieldText("📋 Prérequis", concept.prerequisites.map((p) => p.name).join(", "))),
    );
  }

  if (concept.related.length > 0) {
    container.addTextDisplayComponents(
      textDisplay(fieldText("🔗 Concepts liés", concept.related.map((r) => r.name).join(", "))),
    );
  }

  if (concept.docUrl) {
    container.addTextDisplayComponents(textDisplay(fieldText("📚 Documentation", `[Lien officiel](${concept.docUrl})`)));
  }

  const nextLevel: ExplainLevel = level === "beginner" ? "advanced" : "beginner";
  container.addActionRowComponents(
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(explainButtonCustomId(concept.key, level))
        .setLabel(nextLevel === "advanced" ? "💡 Expliquer en plus avancé" : "💡 Expliquer plus simplement")
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return containerPayload(container);
}

function buildSuggestionsReply(query: string, suggestions: { key: string; name: string }[]): ContainerPayload {
  const container = baseContainer("📖 Aucune correspondance exacte", COLOR_ORANGE).addTextDisplayComponents(
    textDisplay(
      `Rien d'exact pour « ${query} ». Tu voulais peut-être dire :\n` + suggestions.map((s) => `• **${s.name}**`).join("\n"),
    ),
  );

  return containerPayload(container);
}

function buildNotFoundReply(query: string): ContainerPayload {
  const container = baseContainer("📖 Terme introuvable", COLOR_RED).addTextDisplayComponents(
    textDisplay(
      `Aucun résultat pour « ${query} ». Le dictionnaire Nodify est encore jeune — ce terme sera peut-être ajouté bientôt.`,
    ),
  );

  return containerPayload(container);
}

/** Résout une recherche et répond sur n'importe quelle interaction repliable (slash, bouton, modal). */
export async function replyWithConceptSearch(
  interaction: RepliableInteraction,
  query: string,
): Promise<void> {
  const resolution = await resolveConcept(query);

  if (resolution.type === "exact") {
    // Best-effort, jamais bloquant pour l'affichage : voir conceptService.recordConceptView.
    await recordConceptView(interaction.user.id, resolution.concept.key).catch(() => {});
  }

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
