import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { answerDocsQuestion } from "../../documentation/docsService.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("docs")
    .setDescription("Cherche dans la documentation technique Nodify (Node.js, Discord.js, PostgreSQL, OWASP...).")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Ta question (ex: quand ajouter un index, comment différer une réponse...)")
        .setRequired(true),
    ),

  async execute(interaction) {
    const question = interaction.options.getString("question", true);
    await interaction.deferReply();

    const result = await answerDocsQuestion(question);

    if (result.sources.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle("📚 Documentation")
        .setColor("Orange")
        .setDescription(
          `Rien trouvé dans le corpus documentaire Nodify pour « ${question} ». ` +
            "Le corpus est encore petit (Node.js, Discord.js, PostgreSQL, OWASP) — essaie `/explainme` pour une réponse plus générale.",
        );
      await interaction.editReply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder().setTitle("📚 Documentation").setColor("Blue");

    if (result.synthesized) {
      embed.setDescription(result.synthesized);
    } else {
      embed.setDescription(
        "*(Mode démonstration — aucune clé API IA configurée, voici directement les extraits trouvés)*",
      );
    }

    embed.addFields(
      result.sources.map((s) => ({
        name: `${s.source} — ${s.title}`,
        value: `${s.content.slice(0, 200)}${s.content.length > 200 ? "..." : ""}\n[Lien officiel](${s.url})`,
      })),
    );

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
