import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";

/**
 * Commande de vérification : confirme que le command loader, l'event loader
 * et la connexion Discord fonctionnent bout en bout.
 */
const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Vérifie que Nodify répond et affiche la latence."),

  async execute(interaction) {
    const sent = await interaction.reply({
      content: "🏓 Ping...",
      withResponse: true,
    });

    const latency =
      sent.resource!.message!.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply(
      `🏓 Pong ! Latence : \`${latency}ms\` — API : \`${Math.round(interaction.client.ws.ping)}ms\``,
    );
  },
};

export default command;
