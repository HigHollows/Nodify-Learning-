import { config as loadDotenv } from "dotenv";
import { z } from "zod";

loadDotenv();

/**
 * Schéma de validation des variables d'environnement.
 *
 * Pourquoi ici et pas des `process.env.X` éparpillés dans tout le code :
 * - Le bot refuse de démarrer si une variable requise manque ou est invalide,
 *   au lieu de planter en pleine nuit sur une interaction utilisateur.
 * - Un seul endroit à lire pour savoir quelle config le bot attend.
 */
const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(1, "DISCORD_TOKEN est requis"),
  DISCORD_CLIENT_ID: z.string().min(1, "DISCORD_CLIENT_ID est requis"),
  DISCORD_GUILD_ID: z.string().optional(),

  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),

  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // Optionnel : sans clé, l'AIService (src/ai/aiService.ts) bascule
  // automatiquement sur un provider "stub" (réponses de démonstration,
  // aucun appel réseau) — voir src/ai/providers/. Priorité si plusieurs
  // clés sont présentes : Anthropic > Groq > stub (voir aiService.ts).
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),

  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Configuration invalide — vérifie ton fichier .env :");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === "production";
