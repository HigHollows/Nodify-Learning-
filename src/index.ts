import { NodifyClient } from "./client.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./database/client.js";
import { loadCommands } from "./loaders/commandLoader.js";
import { loadEvents } from "./loaders/eventLoader.js";
import { logger } from "./utils/logger.js";

async function main() {
  logger.info(`🚀 Démarrage de Nodify (env: ${env.NODE_ENV})`);

  await connectDatabase();

  const client = new NodifyClient();
  await loadCommands(client);
  await loadEvents(client);

  await client.login(env.DISCORD_TOKEN);

  // Arrêt propre : on ferme la connexion DB et le client Discord avant de quitter,
  // pour ne jamais couper une requête ou une écriture en plein vol.
  const shutdown = async (signal: string) => {
    logger.info(`Signal ${signal} reçu, arrêt de Nodify...`);
    client.destroy();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

// Filet de sécurité : on log toujours l'erreur au lieu de laisser le process
// crasher silencieusement ou continuer dans un état incohérent.
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "Unhandled promise rejection");
});

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception — arrêt du process");
  process.exit(1);
});

main().catch((error) => {
  logger.fatal({ err: error }, "Échec du démarrage de Nodify");
  process.exit(1);
});
