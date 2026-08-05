import {
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";
import {
  runSetup,
  type ResourceStatus,
  type SetupResourceResult,
} from "../../setup/setupService.js";

const STATUS_ICON: Record<ResourceStatus, string> = {
  created: "🆕",
  recovered: "♻️",
  already_ok: "✅",
};

function formatResults(results: SetupResourceResult[]): string {
  if (results.length === 0) return "_Aucun_";
  return results.map((r) => `${STATUS_ICON[r.status]} ${r.label}`).join("\n");
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription(
      "Configure (ou répare) les rôles et salons Nodify sur ce serveur.",
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inCachedGuild()) {
      throw new AppError("Cette commande ne fonctionne que sur un serveur.");
    }

    await interaction.deferReply();

    const report = await runSetup(interaction.guild);

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuration Nodify")
      .setColor("Blue")
      .addFields(
        { name: "Rôles de progression", value: formatResults(report.roles) },
        { name: "Salons", value: formatResults(report.channels) },
      )
      .setFooter({
        text: "🆕 créé · ♻️ réparé (avait été supprimé) · ✅ déjà en place",
      });

    await interaction.editReply({ embeds: [embed] });
  },
};

export default command;
