import type { PrefixCommand } from "../types/prefixCommand.js";
import aiAdminPrefix from "./aiAdminPrefix.js";
import creditAdminPrefix from "./creditAdminPrefix.js";
import setupPrefix from "./setupPrefix.js";
import settingsPrefix from "./settingsPrefix.js";
import statsPrefix from "./statsPrefix.js";
import helpPrefix from "./helpPrefix.js";

/**
 * Préfixe des commandes admin (Phase 11) — séparées des slash commands
 * pour désencombrer le menu `/` des membres normaux : ManageGuild suffit à
 * VOIR une commande admin dans Discord, mais avec 5 commandes admin en plus
 * des ~25 commandes membre, le picker `/` devenait chargé. Registre statique
 * plutôt qu'un scan de dossier comme commandLoader.ts : seulement 6
 * commandes, pas besoin de la complexité d'un chargement dynamique.
 */
export const PREFIX = "+";

export const PREFIX_COMMANDS = new Map<string, PrefixCommand>(
  [aiAdminPrefix, creditAdminPrefix, setupPrefix, settingsPrefix, statsPrefix, helpPrefix].map((cmd) => [cmd.name, cmd]),
);
