import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { NodifyClient } from "../client.js";
import type { Command } from "../types/command.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("commandLoader");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.join(__dirname, "..", "commands");

/** Parcourt src/commands/**\/*.ts (ou .js en prod compilé) récursivement. */
function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.endsWith(".js") || entry.endsWith(".ts")) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Charge toutes les commandes dans `client.commands`.
 * Chaque fichier de commande doit `export default` un objet Command.
 */
export async function loadCommands(client: NodifyClient): Promise<void> {
  const files = walk(COMMANDS_DIR);
  let loaded = 0;

  for (const file of files) {
    const imported = await import(pathToFileURL(file).href);
    const command: Command | undefined = imported.default;

    if (!command?.data || typeof command.execute !== "function") {
      log.warn({ file }, "Fichier de commande invalide, ignoré (export default manquant)");
      continue;
    }

    client.commands.set(command.data.name, command);
    loaded++;
  }

  log.info(`${loaded} commande(s) chargée(s)`);
}

/** Utilisé par deploy-commands.ts, hors instance Client. */
export async function loadCommandDefinitions(): Promise<Command[]> {
  const files = walk(COMMANDS_DIR);
  const commands: Command[] = [];

  for (const file of files) {
    const imported = await import(pathToFileURL(file).href);
    const command: Command | undefined = imported.default;
    if (command?.data && typeof command.execute === "function") {
      commands.push(command);
    }
  }

  return commands;
}
