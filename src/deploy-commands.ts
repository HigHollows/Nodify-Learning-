import { pathToFileURL } from "node:url";
import { REST, Routes } from "discord.js";
import { env } from "./config/env.js";
import { loadCommandDefinitions } from "./loaders/commandLoader.js";
import { childLogger } from "./utils/logger.js";

const log = childLogger("deployCommands");

/**
 * Enregistre les slash commands auprès de Discord.
 *
 * - Si DISCORD_GUILD_ID est défini : déploiement sur cette guild uniquement
 *   (instantané — idéal en dev, pour itérer vite).
 * - Sinon : déploiement global (propagation jusqu'à ~1h — pour la prod).
 *
 * Réutilisée à deux endroits : le script manuel (`npm run deploy:commands`,
 * exécution directe de ce fichier, voir plus bas) ET automatiquement à
 * chaque démarrage du bot (src/index.ts) — pour ne jamais dépendre d'une
 * étape manuelle oubliée après avoir ajouté/modifié une commande. Avec
 * DISCORD_GUILD_ID renseigné, la sync est effective en quelques secondes à
 * chaque redémarrage, jamais plus d'une minute.
 */
export async function deployCommands(): Promise<number> {
  const commands = await loadCommandDefinitions();
  const body = commands.map((c) => c.data.toJSON());

  const rest = new REST().setToken(env.DISCORD_TOKEN);

  if (env.DISCORD_GUILD_ID) {
    await rest.put(
      Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
      { body },
    );
    log.info(
      `${body.length} commande(s) déployée(s) sur la guild ${env.DISCORD_GUILD_ID}`,
    );
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
    log.info(`${body.length} commande(s) déployée(s) globalement`);
  }

  return body.length;
}

// N'exécute le déploiement immédiatement que lorsque ce fichier est lancé
// directement (`npm run deploy:commands`) — pas quand `deployCommands` est
// juste importé depuis src/index.ts pour la sync automatique au démarrage.
const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? "").href;
if (isDirectRun) {
  deployCommands().catch((error: unknown) => {
    log.error(error, "Échec du déploiement des commandes");
    process.exit(1);
  });
}
