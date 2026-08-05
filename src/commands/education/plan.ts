import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { generateLearningPlan, getActiveProviderName } from "../../ai/aiService.js";
import { listCourseSummaries } from "../../education/academyService.js";
import { assertModuleEnabled } from "../../setup/guildSettingsService.js";
import type { Command } from "../../types/command.js";

/**
 * Contrairement à un planificateur qui inventerait un parcours idéal,
 * celui-ci ne recommande QUE des cours réellement présents dans le
 * catalogue Nodify (liste passée explicitement à l'IA) — jamais de cours
 * fictif qui n'existe pas sur la plateforme.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("plan")
    .setDescription("L'IA te propose un parcours Academy personnalisé selon ton objectif.")
    .addStringOption((option) =>
      option
        .setName("objectif")
        .setDescription("Ton objectif (ex: devenir développeur backend Node.js)")
        .setRequired(true)
        .setMaxLength(200),
    ),

  async execute(interaction) {
    await assertModuleEnabled(interaction.guildId, "academy");

    const goal = interaction.options.getString("objectif", true);
    await interaction.deferReply();

    const courses = await listCourseSummaries(interaction.user.id);
    const plan = await generateLearningPlan(
      interaction.user.id,
      goal,
      courses.map((c) => ({
        key: c.key,
        title: c.title,
        description: c.description,
        category: c.category,
        level: c.level,
        status: c.status,
      })),
    );

    const embed = new EmbedBuilder()
      .setTitle(`🗺️ Parcours pour : ${goal}`)
      .setColor("Purple")
      .setDescription(plan)
      .setFooter({
        text:
          getActiveProviderName() === "stub"
            ? "⚠️ Mode démonstration — aucune clé API IA configurée"
            : "Recommandations basées uniquement sur les cours réellement disponibles sur Nodify",
      });

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
