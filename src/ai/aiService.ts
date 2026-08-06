import { logAiCall } from "../database/repositories/aiCallRepository.js";
import { env } from "../config/env.js";
import { assertAiAvailable, recordAiFailure, recordAiSuccess } from "../credits/aiControlService.js";
import { confirmReservation, refundReservation, reserveForFeature } from "../credits/creditService.js";
import { InsufficientCreditsError } from "../utils/errors.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";
import { checkRateLimit } from "../utils/rateLimiter.js";
import { classifyProviderError } from "./aiErrorClassifier.js";
import { getFeatureProviderOverrides } from "./providerConfig.js";
import { AnthropicProvider } from "./providers/anthropicProvider.js";
import { GeminiProvider } from "./providers/geminiProvider.js";
import { GroqProvider } from "./providers/groqProvider.js";
import { StubProvider } from "./providers/stubProvider.js";
import type { AIProvider, LevelHint } from "./types.js";

const log = childLogger("aiService");

/**
 * ModelRouter : instancie TOUS les providers pour lesquels une clé est
 * configurée (pas un seul choisi une fois pour toutes) — permet à
 * `AI_FEATURE_PROVIDER_OVERRIDES` (src/ai/providerConfig.ts) de forcer un
 * provider différent selon la feature (ex: un modèle plus capable sur
 * `/threatmodel`, un plus rapide sur `/debugme`), sans jamais complexifier
 * les commandes elles-mêmes : elles continuent d'appeler `complete()` sans
 * savoir quel provider répond. `StubProvider` est toujours disponible en
 * dernier recours (aucune clé requise).
 */
const providerRegistry = new Map<string, AIProvider>();
if (env.GEMINI_API_KEY) providerRegistry.set("gemini", new GeminiProvider(env.GEMINI_API_KEY, env.GEMINI_MODEL));
if (env.ANTHROPIC_API_KEY) {
  providerRegistry.set("anthropic", new AnthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL));
}
if (env.GROQ_API_KEY) providerRegistry.set("groq", new GroqProvider(env.GROQ_API_KEY, env.GROQ_MODEL));
providerRegistry.set("stub", new StubProvider());

/** Ordre de priorité par défaut quand une feature n'a pas d'override explicite. */
const DEFAULT_PROVIDER_PRIORITY = ["groq", "gemini", "anthropic", "stub"];

function defaultProvider(): AIProvider {
  for (const name of DEFAULT_PROVIDER_PRIORITY) {
    const provider = providerRegistry.get(name);
    if (provider) return provider;
  }
  return providerRegistry.get("stub")!; // toujours présent, voir plus haut
}

/** Résout le provider à utiliser pour une feature donnée (override si configuré et disponible, sinon défaut). */
function resolveProviderForFeature(feature: string): AIProvider {
  const overrides = getFeatureProviderOverrides();
  const overrideName = overrides[feature];
  if (overrideName) {
    const overridden = providerRegistry.get(overrideName);
    if (overridden) return overridden;
    log.warn({ feature, overrideName }, "Provider demandé en override indisponible — fallback sur le défaut");
  }
  return defaultProvider();
}

log.info(
  { providers: [...providerRegistry.keys()], default: defaultProvider().name },
  "AIService initialisé",
);

/** Nom du provider par défaut — utilisé pour l'affichage (AI Control Center) quand aucune feature précise n'est en jeu. */
export function getActiveProviderName(): string {
  return defaultProvider().name;
}

/** Quota anti-abus : au-delà, on bloque plutôt que de laisser exploser la conso du provider actif. */
const AI_RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Point de passage UNIQUE pour tout appel IA. C'est ici, et nulle part
 * ailleurs, que se fait : la vérification du statut IA (AI Control Center),
 * le rate limiting, la réservation/confirmation/remboursement de crédits
 * (Credit Service), et la journalisation (AICall). Architecture :
 *
 *   AI Command → AIService.complete() → Credit Service → AI Provider
 *
 * Aucune commande ne parle jamais directement à un provider IA.
 */
async function complete(
  userId: string,
  feature: string,
  system: string,
  user: string,
  maxTokens?: number,
  guildId?: string,
): Promise<string> {
  await assertAiAvailable(feature);

  const rateLimit = checkRateLimit(
    `ai:${userId}`,
    env.MAX_AI_REQUESTS_PER_MINUTE || Number.POSITIVE_INFINITY,
    AI_RATE_LIMIT_WINDOW_MS,
  );
  if (env.MAX_AI_REQUESTS_PER_MINUTE > 0 && !rateLimit.allowed) {
    throw new AppError(
      `Trop de requêtes IA d'affilée — réessaie dans ${rateLimit.retryAfterSeconds}s.`,
    );
  }

  const provider = resolveProviderForFeature(feature);
  const reservation = await reserveForFeature(userId, guildId, feature, provider.name);
  if (!reservation.ok) {
    throw new InsufficientCreditsError(reservation.required, reservation.current);
  }

  const startedAt = Date.now();

  // Annulation RÉELLE de la requête HTTP sous-jacente au timeout (pas juste
  // un timer qui ignore le résultat) — chaque provider transmet ce signal à
  // son SDK, qui abandonne effectivement l'appel réseau en cours.
  const abortController = new AbortController();
  const timeoutTimer = setTimeout(() => abortController.abort(), env.AI_REQUEST_TIMEOUT_MS);

  try {
    const result = await provider.complete({
      system,
      user,
      ...(maxTokens ? { maxTokens } : {}),
      signal: abortController.signal,
    });
    clearTimeout(timeoutTimer);

    await confirmReservation(reservation.transactionId);
    await recordAiSuccess();
    await logAiCall({
      userId,
      feature,
      provider: provider.name,
      status: "SUCCESS",
      creditCost: reservation.cost,
      latencyMs: Date.now() - startedAt,
      ...(guildId !== undefined ? { guildId } : {}),
      ...(result.model !== undefined ? { model: result.model } : {}),
      ...(result.usage?.inputTokens !== undefined ? { tokensInput: result.usage.inputTokens } : {}),
      ...(result.usage?.outputTokens !== undefined ? { tokensOutput: result.usage.outputTokens } : {}),
    });

    return result.text;
  } catch (error) {
    clearTimeout(timeoutTimer);
    const classified = classifyProviderError(error);

    await refundReservation(reservation.transactionId);
    await recordAiFailure(classified.message, classified.code);
    await logAiCall({
      userId,
      feature,
      provider: provider.name,
      status: classified.code === "TIMEOUT" ? "TIMEOUT" : "ERROR",
      creditCost: reservation.cost,
      refunded: reservation.transactionId !== null,
      latencyMs: Date.now() - startedAt,
      errorMessage: classified.message,
      ...(guildId !== undefined ? { guildId } : {}),
    });

    log.error(
      { err: error, provider: provider.name, feature, errorCode: classified.code },
      "Échec de l'appel au provider IA",
    );
    throw new AppError("Le service IA est momentanément indisponible — tes crédits ont été remboursés, réessaie plus tard.");
  }
}

// --- ExplainMe (Phase 6) ---------------------------------------------------

export interface ExplainRequest {
  term: string;
  levelHint: LevelHint;
  context?: string;
}

export async function explainConcept(
  userId: string,
  request: ExplainRequest,
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es Nodify, un mentor technique pédagogue pour développeurs sur Discord. " +
    "Explique le concept demandé de façon claire et concise (150 mots maximum), " +
    "en français. Adapte le vocabulaire au niveau indiqué : pour un débutant, " +
    "utilise des analogies simples et évite le jargon non expliqué ; pour un " +
    "niveau avancé, va droit aux détails techniques précis. Ne fabrique jamais " +
    "d'information — si tu n'es pas sûr, dis-le.";

  const user = [
    `Explique le concept suivant : "${request.term}".`,
    `Niveau de l'utilisateur : ${request.levelHint}.`,
    request.context ? `Contexte connu du dictionnaire Nodify : ${request.context}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return complete(userId, "explainme", system, user, 600, guildId);
}

/** Question de suivi sur une explication précédente — mémoire courte, un seul tour en arrière. */
export async function explainFollowUp(
  userId: string,
  term: string,
  previousExplanation: string,
  followUpQuestion: string,
  levelHint: LevelHint,
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es Nodify, un mentor technique. Tu poursuis une conversation : l'utilisateur " +
    "a déjà reçu une explication et pose maintenant une question de suivi dessus. " +
    "Réponds en français, en te basant sur le fil de la conversation (ne réexplique " +
    "pas depuis le début), 150 mots maximum. Adapte au niveau indiqué.";

  const user =
    `Terme initial : "${term}".\n` +
    `Ton explication précédente : ${previousExplanation}\n\n` +
    `Question de suivi : ${followUpQuestion}\n` +
    `Niveau de l'utilisateur : ${levelHint}.`;

  return complete(userId, "explainme", system, user, 500, guildId);
}

// --- Security Review (Phase 7) --------------------------------------------

export async function reviewCodeSecurity(userId: string, code: string, guildId?: string): Promise<string> {
  const system =
    "Tu es un ingénieur en sécurité senior qui audite du code pour des développeurs. " +
    "Réponds en français, en markdown. Structure ta réponse par sections de sévérité " +
    "dans cet ordre, en omettant les sections vides : « 🔴 Critique », « 🟠 Élevé », " +
    "« 🟡 Moyen », « 🔵 Faible ». Pour chaque problème trouvé : décris-le en une phrase, " +
    "explique pourquoi c'est un risque, et donne une piste de correction courte. " +
    "Si le code ne présente aucun problème de sécurité notable, dis-le clairement " +
    "au lieu d'inventer des problèmes. Ne réponds qu'avec l'analyse, pas de préambule.";

  const user = `Analyse ce code :\n\`\`\`\n${code}\n\`\`\``;
  return complete(userId, "securityreview", system, user, 900, guildId);
}

export async function suggestCodeFix(
  userId: string,
  code: string,
  findings: string,
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es un ingénieur senior. On te donne du code et une liste de problèmes de " +
    "sécurité identifiés dessus. Réponds UNIQUEMENT avec la version corrigée du " +
    "code dans un bloc de code, suivie d'une liste à puces très courte de ce qui " +
    "a changé. Ne réintroduis aucun des problèmes signalés. N'invente pas de " +
    "fonctionnalités qui n'existaient pas dans l'original.";

  const user = `Code original :\n\`\`\`\n${code}\n\`\`\`\n\nProblèmes identifiés :\n${findings}`;
  return complete(userId, "securityreview", system, user, 900, guildId);
}

// --- Threat Modeling (Phase 8) ---------------------------------------------

export async function analyzeThreatModel(
  userId: string,
  description: string,
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es un architecte sécurité qui fait du threat modeling pour un développeur. " +
    "On te décrit une architecture ou un flux applicatif (pas du code). Réponds en " +
    "français, en markdown, structuré en 3 sections : « 🎯 Actifs à protéger » " +
    "(données/ressources sensibles en jeu), « ⚠️ Menaces principales » (scénarios " +
    "d'attaque plausibles compte tenu de l'architecture décrite), et " +
    "« 🛡️ Protections recommandées » (mesures concrètes, priorisées). Reste " +
    "concis (250 mots maximum). Si la description est trop vague pour analyser " +
    "sérieusement, dis-le et demande les précisions nécessaires plutôt que d'inventer.";

  const user = `Architecture/flux à analyser :\n${description}`;
  return complete(userId, "threatmodel", system, user, 800, guildId);
}

// --- Code Review qualité (Phase 7) ----------------------------------------

export async function reviewCodeQuality(userId: string, code: string, guildId?: string): Promise<string> {
  const system =
    "Tu es un lead developer qui relit du code pour un développeur junior. " +
    "Réponds en français, en markdown, sous forme de liste à puces courte " +
    "(5 points maximum). Concentre-toi sur la lisibilité, le nommage, la " +
    "duplication, et les simplifications possibles — PAS sur la sécurité " +
    "(un autre outil s'en charge). Sois concret : cite la ligne ou l'extrait " +
    "concerné à chaque fois. Si le code est déjà propre, dis-le simplement " +
    "plutôt que d'inventer des remarques.";

  const user = `Relis ce code :\n\`\`\`\n${code}\n\`\`\``;
  return complete(userId, "codereview", system, user, 700, guildId);
}

// --- Debug Coach (Phase 7) -------------------------------------------------

export async function debugGuide(
  userId: string,
  errorMessage: string,
  code: string | undefined,
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es un mentor qui aide un développeur à déboguer SEUL, façon tuteur " +
    "socratique. INTERDICTION de donner directement la solution ou le code " +
    "corrigé. À la place : pose 1 à 2 questions guidantes qui l'aident à " +
    "localiser le problème lui-même, et donne au maximum un indice général " +
    "(pas la ligne exacte à changer). Reste bref (100 mots maximum), en français.";

  const user = [
    `Message d'erreur : ${errorMessage}`,
    code ? `Code concerné :\n\`\`\`\n${code}\n\`\`\`` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n\n");

  return complete(userId, "debugme", system, user, 400, guildId);
}

export async function debugHint(
  userId: string,
  errorMessage: string,
  code: string | undefined,
  previousGuidance: string,
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es un mentor qui aide un développeur à déboguer. Il est déjà bloqué " +
    "après un premier indice socratique. Cette fois, donne un indice PLUS " +
    "PRÉCIS (par exemple la zone du code ou le concept exact en cause), mais " +
    "sans donner directement la ligne corrigée ni le code final. Reste bref " +
    "(100 mots maximum), en français.";

  const user = [
    `Message d'erreur : ${errorMessage}`,
    code ? `Code concerné :\n\`\`\`\n${code}\n\`\`\`` : null,
    `Indice déjà donné précédemment : ${previousGuidance}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n\n");

  return complete(userId, "debugme", system, user, 400, guildId);
}

// --- Documentation RAG (Phase 6) -------------------------------------------

export interface DocChunkRef {
  title: string;
  source: string;
  content: string;
}

export async function answerFromDocs(
  userId: string,
  question: string,
  chunks: DocChunkRef[],
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es Nodify, assistant documentaire pour développeurs. Réponds à la " +
    "question UNIQUEMENT en te basant sur les extraits de documentation " +
    "fournis ci-dessous. Si les extraits ne contiennent pas la réponse, dis-le " +
    "clairement au lieu d'inventer. Cite la source (ex: « Selon Node.js... ») " +
    "quand c'est pertinent. Réponds en français, en 150 mots maximum.";

  const context = chunks
    .map((c, i) => `[Extrait ${i + 1} — ${c.source} : ${c.title}]\n${c.content}`)
    .join("\n\n");

  const user = `Question : ${question}\n\nExtraits disponibles :\n${context}`;
  return complete(userId, "docs", system, user, 600, guildId);
}

// --- Learning Planner (amélioration) ---------------------------------------

export interface PlannerCourse {
  key: string;
  title: string;
  description: string;
  category: string;
  level: number;
  status: "not_started" | "in_progress" | "completed";
}

export async function generateLearningPlan(
  userId: string,
  goal: string,
  availableCourses: PlannerCourse[],
  guildId?: string,
): Promise<string> {
  const system =
    "Tu es un conseiller pédagogique pour Nodify Academy. Voici la liste EXHAUSTIVE " +
    "des cours réellement disponibles sur la plateforme — n'en invente ou n'en " +
    "mentionne AUCUN autre. Pour chaque cours pertinent par rapport à l'objectif " +
    "de l'utilisateur, indique sa clé exacte (entre backticks) et une phrase de " +
    "justification, dans un ordre recommandé. Si aucun cours listé n'est pertinent " +
    "pour l'objectif, dis-le honnêtement plutôt que d'inventer un parcours. Réponds " +
    "en français, en markdown, 200 mots maximum.";

  const catalogue = availableCourses
    .map(
      (c) =>
        `- \`${c.key}\` (${c.title}, ${c.category}, niveau ${c.level}, statut: ${c.status}) — ${c.description}`,
    )
    .join("\n");

  const user = `Objectif de l'utilisateur : ${goal}\n\nCatalogue de cours disponibles :\n${catalogue}`;
  return complete(userId, "plan", system, user, 700, guildId);
}
