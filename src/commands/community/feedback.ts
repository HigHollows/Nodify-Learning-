import { SlashCommandBuilder } from "discord.js";
import { submitFeedback } from "../../services/feedbackService.js";
import { baseContainer, containerPayload, EmbedColors, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription("Signale un bug ou suggère une amélioration pour Nodify.")
    .addStringOption((option) =>
      option.setName("message").setDescription("Ton retour").setRequired(true).setMaxLength(1000),
    ),

  async execute(interaction) {
    const message = interaction.options.getString("message", true);

    await submitFeedback(interaction.client, interaction.user.id, interaction.user.username, interaction.guildId, message);

    await interaction.reply(
      containerPayload(
        baseContainer("✅ Merci pour ton retour !", EmbedColors.operational).addTextDisplayComponents(
          textDisplay("Ton message a bien été enregistré."),
        ),
      ),
    );
  },
};

export default command;
