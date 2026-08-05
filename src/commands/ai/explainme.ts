import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { explainConcept, getActiveProviderName } from "../../ai/aiService.js";
import { resolveConcept } from "../../knowledge/conceptService.js";
import { getProfile } from "../../services/userService.js";
import type { Command } from "../../types/command.js";
import { levelForXp } from "../../utils/leveling.js";

/**
 * Contrairement à /dictionary, /explainme fonctionne sur N'IMPORTE QUEL
 * terme, pas seulement ceux déjà catalogués. Si le terme existe dans le
 * dictionnaire, sa définition est passée en contexte à l'IA pour éviter
 * qu'elle réponde à côté ou invente — sinon elle répond de ses connaissances
 * générales.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("explainme")
    .setDescription("Demande à l'IA Nodify d'expliquer un concept technique, adapté à ton niveau.")
    .addStringOption((option) =>
      option
        .setName("terme")
        .setDescription("Le concept à expliquer (ex: event loop, sql injection, closures...)")
        .setRequired(true),
    ),

  async execute(interaction) {
    const term = interaction.options.getString("terme", true);
    await interaction.deferReply();

    const [profile, resolution] = await Promise.all([
      getProfile(interaction.user.id),
      resolveConcept(term),
    ]);

    // Heuristique simple : niveau global bas (Beginner/Novice) → explication
    // vulgarisée, sinon explication technique directe.
    const levelHint = !profile || levelForXp(profile.totalXp).index <= 1 ? "beginner" : "advanced";

    const explanation = await explainConcept({
      term,
      levelHint,
      ...(resolution.type === "exact" ? { context: resolution.concept.definition } : {}),
    });

    const embed = new EmbedBuilder()
      .setTitle(`🤖 Explication : ${term}`)
      .setColor("Purple")
      .setDescription(explanation)
      .setFooter({
        text:
          getActiveProviderName() === "stub"
            ? "⚠️ Mode démonstration — aucune clé API IA configurée"
            : "Généré par IA — vérifie les informations critiques avant de t'y fier",
      });

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
