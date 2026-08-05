import { PrismaClient } from "@prisma/client";
import { childLogger } from "../utils/logger.js";

const log = childLogger("database");

/**
 * Instance unique de PrismaClient, partagée dans toute l'app.
 *
 * En dev avec `tsx watch`, le module est rechargé à chaque changement de
 * fichier : sans précaution on ouvrirait une nouvelle connexion à chaque
 * hot-reload jusqu'à épuiser les connexions disponibles. On accroche donc
 * l'instance sur `globalThis` pour la réutiliser entre les reloads.
 */
function createPrismaClient() {
  return new PrismaClient({
    log: [
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

prisma.$on("warn", (e) => log.warn(e, "Prisma warning"));
prisma.$on("error", (e) => log.error(e, "Prisma error"));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase() {
  await prisma.$connect();
  log.info("Connecté à la base de données");
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  log.info("Déconnecté de la base de données");
}
