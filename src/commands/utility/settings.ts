import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { getModuleFlags, setModuleFlags } from "../../setup/guildSettingsService.js";
import { baseContainer, containerPayload, textDisplay } from "../../ui/container.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";

const COLOR_BLUE = 0x3498db;

function statusLine(label: string, enabled: boolean): string {
  return `${enabled ? "✅" : "❌"} ${label}`;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Active/désactive les modules Nodify sur ce serveur (admin).")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addBooleanOption((option) =>
      option.setName("academy").setDescription("Activer/désactiver l'Academy (/learn, /plan)").setRequired(false),
    )
    .addBooleanOption((option) =>
      option.setName("cyber").setDescription("Activer/désactiver la Cyber Academy (/cyber)").setRequired(false),
    )
    .addBooleanOption((option) =>
      option
        .setName("news")
        .setDescription("Activer/désactiver le post automatique des Hacktualités")
        .setRequired(false),
    )
    .addBooleanOption((option) =>
      option.setName("daily").setDescription("Activer/désactiver la Question du jour").setRequired(false),
    ),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      throw new AppError("Cette commande ne fonctionne que sur un serveur.");
    }

    const academy = interaction.options.getBoolean("academy");
    const cyber = interaction.options.getBoolean("cyber");
    const news = interaction.options.getBoolean("news");
    const daily = interaction.options.getBoolean("daily");

    const updates: Parameters<typeof setModuleFlags>[1] = {};
    if (academy !== null) updates.academyEnabled = academy;
    if (cyber !== null) updates.cyberEnabled = cyber;
    if (news !== null) updates.newsEnabled = news;
    if (daily !== null) updates.dailyQuestionEnabled = daily;

    if (Object.keys(updates).length > 0) {
      await setModuleFlags(interaction.guildId, updates);
    }

    const flags = await getModuleFlags(interaction.guildId);

    const container = baseContainer("⚙️ Réglages Nodify", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        [
          statusLine("Academy (`/learn`, `/plan`)", flags.academyEnabled),
          statusLine("Cyber Academy (`/cyber`)", flags.cyberEnabled),
          statusLine("Hacktualités (post automatique)", flags.newsEnabled),
          statusLine("Question du jour (`/trivia` + post auto)", flags.dailyQuestionEnabled),
        ].join("\n"),
      ),
      textDisplay(`-# ${Object.keys(updates).length > 0 ? "Réglages mis à jour." : "Aucun changement demandé — voici l'état actuel."}`),
    );

    await interaction.reply(containerPayload(container));
  },
};

export default command;
