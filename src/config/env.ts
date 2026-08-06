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

/** "true"/"false" (insensible à la casse) → boolean, avec une valeur par défaut. */
function envBool(defaultValue: boolean) {
  return z
    .string()
    .optional()
    .transform((v) => (v === undefined ? defaultValue : v.toLowerCase() === "true"));
}

/** Chaîne numérique → number, avec une valeur par défaut si absente ou invalide. */
function envInt(defaultValue: number) {
  return z
    .string()
    .optional()
    .transform((v) => {
      const parsed = v === undefined ? NaN : Number(v);
      return Number.isFinite(parsed) ? parsed : defaultValue;
    });
}

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
  // clés sont présentes : Groq > Gemini > Anthropic > stub (voir aiService.ts).
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-5"),

  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.3-70b-versatile"),

  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),

  // --- AI Credit System — interrupteur maître + config statique ---
  // Séparation volontaire : les interrupteurs "durs" (nécessitent un
  // redémarrage pour changer) et les secrets vivent en .env ; l'intention
  // admin qui doit changer SANS redémarrage (mode IA ouvert/fermé/maintenance)
  // vit en base (SystemConfig) — voir src/credits/aiControlService.ts.
  CREDITS_ENABLED: envBool(true),

  DAILY_REWARD_ENABLED: envBool(true),
  DAILY_REWARD_AMOUNT: envInt(5),
  WEEKLY_REWARD_ENABLED: envBool(true),
  WEEKLY_REWARD_AMOUNT: envInt(100),
  MONTHLY_REWARD_ENABLED: envBool(true),
  MONTHLY_REWARD_AMOUNT: envInt(500),
  LEARNING_REWARDS_ENABLED: envBool(true),

  // Mode IA par défaut au tout premier démarrage (avant qu'un admin n'ait
  // jamais touché à /ai) — ensuite l'état réel vit en base et survit aux redémarrages.
  AI_DEFAULT_MODE: z.enum(["OPEN", "LIMITED", "MAINTENANCE", "CLOSED"]).default("OPEN"),
  AI_STATUS_ENABLED: envBool(true),
  AI_STATUS_AUTO_UPDATE: envBool(true),
  // Optionnel : rôle Discord mentionné sur une alerte "AI Incident"
  // (dégradation ET retour à la normale) en plus du message dans le salon de
  // statut. Sans cette variable, l'alerte reste un message normal, non ping.
  AI_INCIDENT_PING_ROLE_ID: z.string().optional(),

  // Anti-abus — désactivables individuellement en mettant la valeur à 0.
  // Valeurs globales (défaut) — un serveur peut les surcharger via
  // `/ai budget` (GuildConfig.maxDailyAiSpend/maxMonthlyAiSpend), voir
  // creditService.reserveForFeature.
  MAX_AI_REQUESTS_PER_MINUTE: envInt(5),
  MAX_DAILY_AI_SPEND: envInt(100),
  MAX_MONTHLY_AI_SPEND: envInt(5000),

  // Délai avant qu'un appel IA soit considéré en timeout (remboursé,
  // classifié TIMEOUT) — le provider actif continue potentiellement en
  // arrière-plan, mais l'utilisateur n'attend jamais indéfiniment.
  AI_REQUEST_TIMEOUT_MS: envInt(30_000),

  // Multi-provider : permet de forcer un provider précis pour une feature
  // donnée (JSON `{"feature": "provider"}`), et de faire coûter plus cher
  // les features qui tournent sur un provider plus cher (JSON
  // `{"provider": multiplicateur}`, défaut 1 si absent). Optionnel — sans
  // ces variables, un seul provider (le prioritaire disponible) est utilisé
  // pour tout, comme avant.
  AI_FEATURE_PROVIDER_OVERRIDES: z.string().optional(),
  AI_PROVIDER_COST_MULTIPLIERS: z.string().optional(),

  // Reward Engine — bonus supporter non-monétaire (statut attribué par un
  // admin, pas acheté) sur la récompense MONTHLY.
  SUPPORTER_MONTHLY_BONUS_AMOUNT: envInt(200),

  // Optionnel : id Discord du propriétaire du bot — /feedback lui envoie un
  // DM en plus de toujours persister le signalement en base (voir
  // services/feedbackService.ts). Sans cette variable, seule la
  // persistance a lieu (consultable via +feedback).
  OWNER_DISCORD_ID: z.string().optional(),
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
