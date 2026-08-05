import type { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { getConceptDetail } from "../knowledge/conceptService.js";
import {
  DICTIONARY_SEARCH_MODAL_INPUT_ID,
  buildConceptReply,
  buildSearchModal,
  parseExplainCustomId,
  replyWithConceptSearch,
} from "../commands/knowledge/dictionaryView.js";
import { AppError } from "../utils/errors.js";

/** Bouton "🔎 Rechercher" de l'accueil du dictionnaire → ouvre le Modal de recherche. */
export async function handleSearchButton(interaction: ButtonInteraction): Promise<void> {
  await interaction.showModal(buildSearchModal());
}

/** Soumission du Modal de recherche → résout et affiche le concept trouvé. */
export async function handleSearchModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
  const term = interaction.fields.getTextInputValue(DICTIONARY_SEARCH_MODAL_INPUT_ID);
  await replyWithConceptSearch(interaction, term);
}

/** Bouton "💡 Expliquer" sur une fiche concept → bascule débutant ⇄ avancé. */
export async function handleExplainToggle(interaction: ButtonInteraction): Promise<void> {
  const parsed = parseExplainCustomId(interaction.customId);
  if (!parsed) {
    throw new AppError("Ce bouton n'est plus valide.");
  }

  const concept = await getConceptDetail(parsed.key);
  if (!concept) {
    throw new AppError("Ce concept n'existe plus dans le dictionnaire.");
  }

  const nextLevel = parsed.level === "beginner" ? "advanced" : "beginner";
  await interaction.update(buildConceptReply(concept, nextLevel));
}
