import { NodifyClient } from "./client.js";
import { checkAndPostDailyQuestions } from "./community/dailyQuestionService.js";
import { checkAndPostNews } from "./community/newsService.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./database/client.js";
import { loadCommands } from "./loaders/commandLoader.js";
import { loadEvents } from "./loaders/eventLoader.js";
import { logger } from "./utils/logger.js";

/** Vérifie toutes les 15 minutes s'il faut poster la question du jour quelque part. */
const DAILY_QUESTION_CHECK_INTERVAL_MS = 15 * 60 * 1000;
/** Les flux RSS bougent moins souvent — vérification toutes les 30 minutes suffit. */
const NEWS_CHECK_INTERVAL_MS = 30 * 60 * 1000;

async function main() {
  logger.info(`🚀 Démarrage de Nodify (env: ${env.NODE_ENV})`);

  await connectDatabase();

  const client = new NodifyClient();
  await loadCommands(client);
  await loadEvents(client);

  await client.login(env.DISCORD_TOKEN);

  // Vérification immédiate au démarrage (utile après un redémarrage tardif
  // dans la journée), puis toutes les 15 minutes. checkAndPostDailyQuestions
  // est idempotente : rien ne se passe si déjà postée aujourd'hui.
  const dailyQuestionInterval = setInterval(() => {
    checkAndPostDailyQuestions(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec de la vérification de la question du jour");
    });
  }, DAILY_QUESTION_CHECK_INTERVAL_MS);
  client.once("ready", () => {
    checkAndPostDailyQuestions(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec de la vérification initiale de la question du jour");
    });
    checkAndPostNews(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec de la vérification initiale des actus");
    });
  });

  // Hacktualités : jamais d'actu inventée — uniquement de vrais flux RSS
  // (voir src/community/newsService.ts). Idempotent, sûr à appeler en boucle.
  const newsInterval = setInterval(() => {
    checkAndPostNews(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec de la vérification des actus");
    });
  }, NEWS_CHECK_INTERVAL_MS);

  // Arrêt propre : on ferme la connexion DB et le client Discord avant de quitter,
  // pour ne jamais couper une requête ou une écriture en plein vol.
  const shutdown = async (signal: string) => {
    logger.info(`Signal ${signal} reçu, arrêt de Nodify...`);
    clearInterval(dailyQuestionInterval);
    clearInterval(newsInterval);
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
