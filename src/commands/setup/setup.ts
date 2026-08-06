import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import type { Command } from "../../types/command.js";
import { AppError } from "../../utils/errors.js";
import {
  runSetup,
  type ResourceStatus,
  type SetupResourceResult,
} from "../../setup/setupService.js";
import { baseContainer, containerPayload, fieldText, textDisplay } from "../../ui/container.js";

const COLOR_BLUE = 0x3498db;

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

    const container = baseContainer("⚙️ Configuration Nodify", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        [
          fieldText("Rôles de progression", formatResults(report.roles)),
          fieldText("Salons", formatResults(report.channels)),
        ].join("\n\n"),
      ),
      textDisplay("-# 🆕 créé · ♻️ réparé ou retrouvé (déjà présent mais pas suivi) · ✅ déjà en place"),
    );

    await interaction.editReply(containerPayload(container));
  },
};

export default command;
