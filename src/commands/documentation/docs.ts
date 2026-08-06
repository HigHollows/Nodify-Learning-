import { SlashCommandBuilder } from "discord.js";
import { answerDocsQuestion } from "../../documentation/docsService.js";
import { baseContainer, containerPayload, fieldText, textDisplay, thinSeparator } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const COLOR_ORANGE = 0xe67e22;
const COLOR_BLUE = 0x3498db;

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("docs")
    .setDescription("Cherche dans la documentation technique Nodify (Node.js, Discord.js, PostgreSQL, OWASP...).")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("Ta question (ex: quand ajouter un index, comment différer une réponse...)")
        .setRequired(true)
        .setMaxLength(300),
    ),

  async execute(interaction) {
    const question = interaction.options.getString("question", true);
    await interaction.deferReply();

    const result = await answerDocsQuestion(interaction.user.id, question, interaction.guildId ?? undefined);

    if (result.sources.length === 0) {
      const container = baseContainer("📚 Documentation", COLOR_ORANGE).addTextDisplayComponents(
        textDisplay(
          `Rien trouvé dans le corpus documentaire Nodify pour « ${question} ». ` +
            "Le corpus est encore petit (Node.js, Discord.js, PostgreSQL, OWASP) — essaie `/explainme` pour une réponse plus générale.",
        ),
      );
      await interaction.editReply(containerPayload(container));
      return;
    }

    const container = baseContainer("📚 Documentation", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        result.synthesized ?? "*(Mode démonstration — aucune clé API IA configurée, voici directement les extraits trouvés)*",
      ),
    );

    container.addSeparatorComponents(thinSeparator());
    container.addTextDisplayComponents(
      textDisplay(
        result.sources
          .map((s) =>
            fieldText(
              `${s.source} — ${s.title}`,
              `${s.content.slice(0, 200)}${s.content.length > 200 ? "..." : ""}\n[Lien officiel](${s.url})`,
            ),
          )
          .join("\n\n"),
      ),
    );

    await interaction.editReply(containerPayload(container));
  },
};

export default command;
