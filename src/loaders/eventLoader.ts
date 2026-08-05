import { readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { NodifyClient } from "../client.js";
import type { Event } from "../types/event.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("eventLoader");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = path.join(__dirname, "..", "events");

/** Charge tous les handlers d'events depuis src/events/*.ts et les branche sur le client. */
export async function loadEvents(client: NodifyClient): Promise<void> {
  const files = readdirSync(EVENTS_DIR).filter(
    (f) => f.endsWith(".js") || f.endsWith(".ts"),
  );
  let loaded = 0;

  for (const file of files) {
    const fullPath = path.join(EVENTS_DIR, file);
    const imported = await import(pathToFileURL(fullPath).href);
    const event: Event | undefined = imported.default;

    if (!event?.name || typeof event.execute !== "function") {
      log.warn({ file }, "Fichier d'event invalide, ignoré (export default manquant)");
      continue;
    }

    if (event.once) {
      client.once(event.name, (...args) => void event.execute(...args));
    } else {
      client.on(event.name, (...args) => void event.execute(...args));
    }
    loaded++;
  }

  log.info(`${loaded} event(s) chargé(s)`);
}
