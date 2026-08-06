import { NodifyClient } from "./client.js";
import { checkAndPostDailyQuestions } from "./community/dailyQuestionService.js";
import { checkAndPostNews } from "./community/newsService.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./database/client.js";
import { deployCommands } from "./deploy-commands.js";
import { refreshStatusPanel } from "./credits/statusPanelService.js";
import { loadCommands } from "./loaders/commandLoader.js";
import { loadEvents } from "./loaders/eventLoader.js";
import { logger } from "./utils/logger.js";
import { checkAndSendStreakReminders } from "./progression/streakReminderService.js";
import { checkAndSendWeeklyRecaps } from "./progression/weeklyRecapService.js";

/** Vérifie toutes les 15 minutes s'il faut poster la question du jour quelque part. */
const DAILY_QUESTION_CHECK_INTERVAL_MS = 15 * 60 * 1000;
/** Les flux RSS bougent moins souvent — vérification toutes les 30 minutes suffit. */
const NEWS_CHECK_INTERVAL_MS = 30 * 60 * 1000;
/** Le panneau de statut IA n'a pas besoin d'un rafraîchissement temps réel. */
const AI_STATUS_PANEL_REFRESH_INTERVAL_MS = 10 * 60 * 1000;
/** Rappels de streak / récap hebdo : les deux se auto-limitent en interne (heure/jour UTC) — 15min suffit pour ne pas rater la fenêtre. */
const PROGRESSION_DM_CHECK_INTERVAL_MS = 15 * 60 * 1000;

async function main() {
  logger.info(`🚀 Démarrage de Nodify (env: ${env.NODE_ENV})`);

  await connectDatabase();

  const client = new NodifyClient();
  await loadCommands(client);
  await loadEvents(client);

  // Sync automatique des slash commands à chaque démarrage — jamais besoin
  // de se souvenir de lancer `npm run deploy:commands` après un ajout/modif
  // de commande. Avec DISCORD_GUILD_ID renseigné (déploiement sur une seule
  // guild), Discord synchronise en quelques secondes ; sans ça (déploiement
  // global), la propagation peut prendre jusqu'à ~1h côté Discord — rien
  // côté Nodify ne peut aller plus vite que ça. Résiliente : un échec ne
  // doit jamais empêcher le bot de démarrer (les commandes existantes
  // restent utilisables même si la resync a échoué).
  await deployCommands().catch((error: unknown) => {
    logger.error({ err: error }, "Échec de la synchronisation automatique des slash commands au démarrage");
  });

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
    // Récupère/vérifie/met à jour le panneau de statut IA existant (jamais
    // recréé sans raison) — le recrée automatiquement si le message a été
    // supprimé. No-op si /ai panel n'a jamais été lancé une première fois.
    refreshStatusPanel(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec du rafraîchissement initial du panneau de statut IA");
    });
  });

  // Hacktualités : jamais d'actu inventée — uniquement de vrais flux RSS
  // (voir src/community/newsService.ts). Idempotent, sûr à appeler en boucle.
  const newsInterval = setInterval(() => {
    checkAndPostNews(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec de la vérification des actus");
    });
  }, NEWS_CHECK_INTERVAL_MS);

  // env.AI_STATUS_AUTO_UPDATE vérifié à l'intérieur de refreshStatusPanel
  // lui-même (via env.AI_STATUS_ENABLED) — pas la peine de dupliquer la
  // condition ici, l'appel reste un simple no-op si désactivé.
  const aiStatusPanelInterval = setInterval(() => {
    if (!env.AI_STATUS_AUTO_UPDATE) return;
    refreshStatusPanel(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec du rafraîchissement du panneau de statut IA");
    });
  }, AI_STATUS_PANEL_REFRESH_INTERVAL_MS);

  // Rappel de streak (DM en fin de journée UTC) + récap hebdo (DM le lundi)
  // — chaque service vérifie lui-même l'heure/jour et l'idempotence en
  // interne, un simple check périodique suffit ici (voir progression/).
  const progressionDmInterval = setInterval(() => {
    checkAndSendStreakReminders(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec du check de rappel de streak");
    });
    checkAndSendWeeklyRecaps(client).catch((error: unknown) => {
      logger.error({ err: error }, "Échec du check de récap hebdo");
    });
  }, PROGRESSION_DM_CHECK_INTERVAL_MS);

  // Arrêt propre : on ferme la connexion DB et le client Discord avant de quitter,
  // pour ne jamais couper une requête ou une écriture en plein vol.
  const shutdown = async (signal: string) => {
    logger.info(`Signal ${signal} reçu, arrêt de Nodify...`);
    clearInterval(dailyQuestionInterval);
    clearInterval(newsInterval);
    clearInterval(aiStatusPanelInterval);
    clearInterval(progressionDmInterval);
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
