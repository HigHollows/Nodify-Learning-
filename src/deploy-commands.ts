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
 * À lancer manuellement après chaque ajout/modif de commande : npm run deploy:commands
 */
async function main() {
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
}

main().catch((error) => {
  log.error(error, "Échec du déploiement des commandes");
  process.exit(1);
});
