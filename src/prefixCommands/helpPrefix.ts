import { baseContainer, containerPayload, fieldText, textDisplay } from "../ui/container.js";
import type { PrefixCommand } from "../types/prefixCommand.js";
// Import circulaire assumé avec registry.ts (qui importe ce fichier pour
// l'enregistrer) : sûr ici car PREFIX_COMMANDS n'est lu qu'à l'intérieur de
// `execute`, jamais au chargement du module — par exécution, les deux
// modules sont déjà entièrement évalués (liaison vive ESM standard).
import { PREFIX, PREFIX_COMMANDS } from "./registry.js";

const COLOR_BLUE = 0x3498db;

const command: PrefixCommand = {
  name: "help",
  description: "Liste les commandes admin en préfixe +.",
  usage: "+help",

  async execute(message) {
    const lines = [...PREFIX_COMMANDS.values()]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cmd) => fieldText(`${PREFIX}${cmd.name}`, `${cmd.description}\n\`${cmd.usage}\``));

    const container = baseContainer("🔧 Commandes admin Nodify", COLOR_BLUE).addTextDisplayComponents(
      textDisplay(
        "Réservées aux membres avec la permission **Gérer le serveur** — invisibles du menu `/` pour ne pas " +
          "encombrer les commandes des membres normaux.",
      ),
      textDisplay(lines.join("\n\n")),
    );

    await message.reply(containerPayload(container));
  },
};

export default command;
