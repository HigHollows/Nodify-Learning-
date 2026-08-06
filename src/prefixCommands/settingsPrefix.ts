import { getModuleFlags, setModuleFlags } from "../setup/guildSettingsService.js";
import { baseContainer, containerPayload, textDisplay } from "../ui/container.js";
import type { PrefixCommand } from "../types/prefixCommand.js";
import { getBooleanOption } from "./parseArgs.js";
import { AppError } from "../utils/errors.js";

const COLOR_BLUE = 0x3498db;

function statusLine(label: string, enabled: boolean): string {
  return `${enabled ? "✅" : "❌"} ${label}`;
}

const command: PrefixCommand = {
  name: "settings",
  description: "Active/désactive les modules Nodify sur ce serveur.",
  usage: "+settings [academy:true|false] [cyber:true|false] [news:true|false] [daily:true|false]",

  async execute(message, args) {
    if (!message.inGuild()) {
      throw new AppError("Cette commande ne fonctionne que sur un serveur.");
    }

    const academy = getBooleanOption(args, "academy");
    const cyber = getBooleanOption(args, "cyber");
    const news = getBooleanOption(args, "news");
    const daily = getBooleanOption(args, "daily");

    const updates: Parameters<typeof setModuleFlags>[1] = {};
    if (academy !== null) updates.academyEnabled = academy;
    if (cyber !== null) updates.cyberEnabled = cyber;
    if (news !== null) updates.newsEnabled = news;
    if (daily !== null) updates.dailyQuestionEnabled = daily;

    if (Object.keys(updates).length > 0) {
      await setModuleFlags(message.guildId, updates);
    }

    const flags = await getModuleFlags(message.guildId);

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

    await message.reply(containerPayload(container));
  },
};

export default command;
