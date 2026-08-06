import { runSetup, type ResourceStatus, type SetupResourceResult } from "../setup/setupService.js";
import { baseContainer, containerPayload, fieldText, textDisplay } from "../ui/container.js";
import type { PrefixCommand } from "../types/prefixCommand.js";
import { AppError } from "../utils/errors.js";

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

const command: PrefixCommand = {
  name: "setup",
  description: "Configure (ou répare) les rôles et salons Nodify sur ce serveur.",
  usage: "+setup",

  async execute(message) {
    if (!message.inGuild() || !message.guild) {
      throw new AppError("Cette commande ne fonctionne que sur un serveur.");
    }

    const report = await runSetup(message.guild);

    const container = baseContainer("⚙️ Configuration Nodify", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        [
          fieldText("Rôles de progression", formatResults(report.roles)),
          fieldText("Salons", formatResults(report.channels)),
        ].join("\n\n"),
      ),
      textDisplay("-# 🆕 créé · ♻️ réparé ou retrouvé (déjà présent mais pas suivi) · ✅ déjà en place"),
    );

    await message.reply(containerPayload(container));
  },
};

export default command;
