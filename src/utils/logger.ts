import pino from "pino";
import { env, isProduction } from "../config/env.js";

/**
 * Logger central de Nodify.
 *
 * En dev : sortie lisible et colorée (pino-pretty).
 * En prod : JSON brut sur stdout, prêt à être ingéré par un collecteur de logs.
 *
 * Ne jamais utiliser console.log ailleurs dans le code applicatif —
 * ce logger doit rester le seul point de sortie pour pouvoir un jour
 * router les logs (fichiers, service externe, alerting) sans tout réécrire.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }),
});

export function childLogger(scope: string) {
  return logger.child({ scope });
}
