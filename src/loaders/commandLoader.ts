import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { NodifyClient } from "../client.js";
import type { Command } from "../types/command.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("commandLoader");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.join(__dirname, "..", "commands");

/**
 * Parcourt src/commands/**\/*.ts (ou .js en prod compilé) récursivement.
 * Exclut les fichiers *.test.ts/*.test.js : `dist/` (build de prod) ne les
 * contient déjà plus (tsconfig.build.json), mais `tsx` (dev/deploy:commands)
 * exécute directement sur src/ et les verrait sinon — un fichier de test
 * importé hors du runner vitest plante (describe/it non définis).
 */
function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...walk(fullPath));
    } else if (/\.(js|ts)$/.test(entry) && !/\.test\.(js|ts)$/.test(entry)) {
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
    const imported: unknown = await import(pathToFileURL(file).href);
    const command = (imported as { default?: Command }).default;

    // Beaucoup de fichiers dans src/commands/<domaine>/ sont des modules
    // partagés (vues, parseurs de customId...) sans export default, pas des
    // commandes — c'est attendu, pas la peine de le crier en warning.
    if (!command) continue;

    if (!command.data || typeof command.execute !== "function") {
      log.warn({ file }, "Export default invalide pour une commande (data/execute manquant)");
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
    const imported: unknown = await import(pathToFileURL(file).href);
    const command = (imported as { default?: Command }).default;
    if (command?.data && typeof command.execute === "function") {
      commands.push(command);
    }
  }

  return commands;
}
