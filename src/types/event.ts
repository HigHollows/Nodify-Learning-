import type { ClientEvents } from "discord.js";

/** Contrat que tout handler d'event Discord.js doit respecter. */
export interface Event<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  /** true = déclenché une seule fois (ex: "ready"), false = à chaque fois. */
  once?: boolean;
  execute: (...args: ClientEvents[K]) => Promise<void> | void;
}
