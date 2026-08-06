import { getRecentFeedback } from "../services/feedbackService.js";
import { baseContainer, containerPayload, fieldText, textDisplay } from "../ui/container.js";
import type { PrefixCommand } from "../types/prefixCommand.js";

const COLOR_BLUE = 0x3498db;
const DEFAULT_LIMIT = 10;

const command: PrefixCommand = {
  name: "feedback",
  description: "Liste les derniers retours envoyés via /feedback.",
  usage: "+feedback",

  async execute(message) {
    const reports = await getRecentFeedback(DEFAULT_LIMIT);

    const container = baseContainer("📬 Derniers feedbacks", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        reports.length > 0
          ? reports
              .map((r) => fieldText(`${r.user.username} — ${r.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC`, r.message))
              .join("\n\n")
          : "Aucun feedback pour l'instant.",
      ),
    );

    await message.reply(containerPayload(container));
  },
};

export default command;
