import type { Client } from "discord.js";
import type { Event } from "../types/event.js";
import { childLogger } from "../utils/logger.js";

const log = childLogger("ready");

const event: Event<"ready"> = {
  name: "ready",
  once: true,
  execute(client: Client<true>) {
    log.info(
      `✅ Nodify est en ligne — connecté en tant que ${client.user.tag} (${client.guilds.cache.size} serveur(s))`,
    );
  },
};

export default event;
