import type { Message } from "discord.js";
import type { ParsedPrefixArgs } from "../prefixCommands/parseArgs.js";

/**
 * Contrat des commandes admin en préfixe `+` (voir src/prefixCommands/) —
 * séparé du contrat `Command` (slash) pour ne jamais mélanger les deux
 * mondes : une commande + n'a pas d'`InteractionReplyOptions`, pas
 * d'autocomplete, pas de permission Discord native (vérifiée manuellement
 * dans messageCreate.ts avant d'appeler `execute`).
 */
export interface PrefixCommand {
  name: string; // ex: "ai", "credit-admin" — tapé après le préfixe, insensible à la casse
  description: string;
  usage: string; // ex: "+ai <status|open|close...> [raison:\"...\"]" — affiché par +help
  execute: (message: Message, args: ParsedPrefixArgs) => Promise<void>;
}
