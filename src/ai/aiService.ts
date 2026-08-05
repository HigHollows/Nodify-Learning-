import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";
import { checkRateLimit } from "../utils/rateLimiter.js";
import { AnthropicProvider } from "./providers/anthropicProvider.js";
import { GroqProvider } from "./providers/groqProvider.js";
import { StubProvider } from "./providers/stubProvider.js";
import type { AIProvider, LevelHint } from "./types.js";

const log = childLogger("aiService");

/**
 * ModelRouter minimal : un seul provider actif à la fois, choisi une fois
 * au démarrage selon la config disponible. Priorité si plusieurs clés sont
 * présentes : Anthropic > Groq > stub — Anthropic reste le choix par défaut
 * recommandé (Phase 1), Groq est une alternative rapide/gratuite.
 */
function selectProvider(): AIProvider {
  if (env.ANTHROPIC_API_KEY) return new AnthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL);
  if (env.GROQ_API_KEY) return new GroqProvider(env.GROQ_API_KEY, env.GROQ_MODEL);
  return new StubProvider();
}

const activeProvider: AIProvider = selectProvider();

log.info(`AIService initialisé — provider actif : ${activeProvider.name}`);

export function getActiveProviderName(): string {
  return activeProvider.name;
}

/** Quota anti-abus : au-delà, on bloque plutôt que de laisser exploser la conso du provider actif. */
const AI_RATE_LIMIT = 8;
const AI_RATE_LIMIT_WINDOW_MS = 2 * 60 * 1000;

/**
 * Point de passage unique pour tout appel IA — c'est ici, et nulle part
 * ailleurs, qu'on applique le rate limiting : peu importe la feature qui
 * appelle (ExplainMe, Security Review...), la protection s'applique de la
 * même façon sans devoir être dupliquée dans chaque commande.
 */
async function complete(
  userId: string,
  system: string,
  user: string,
  maxTokens?: number,
): Promise<string> {
  const rateLimit = checkRateLimit(`ai:${userId}`, AI_RATE_LIMIT, AI_RATE_LIMIT_WINDOW_MS);
  if (!rateLimit.allowed) {
    throw new AppError(
      `Trop de requêtes IA d'affilée — réessaie dans ${rateLimit.retryAfterSeconds}s.`,
    );
  }

  try {
    return await activeProvider.complete({ system, user, ...(maxTokens ? { maxTokens } : {}) });
  } catch (error) {
    log.error({ err: error, provider: activeProvider.name }, "Échec de l'appel au provider IA");
    throw new AppError("Le service IA est momentanément indisponible, réessaie plus tard.");
  }
}

// --- ExplainMe (Phase 6) ---------------------------------------------------

export interface ExplainRequest {
  term: string;
  levelHint: LevelHint;
  context?: string;
}

export async function explainConcept(userId: string, request: ExplainRequest): Promise<string> {
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

  return complete(userId, system, user, 600);
}

/** Question de suivi sur une explication précédente — mémoire courte, un seul tour en arrière. */
export async function explainFollowUp(
  userId: string,
  term: string,
  previousExplanation: string,
  followUpQuestion: string,
  levelHint: LevelHint,
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

  return complete(userId, system, user, 500);
}

// --- Security Review (Phase 7) --------------------------------------------

export async function reviewCodeSecurity(userId: string, code: string): Promise<string> {
  const system =
    "Tu es un ingénieur en sécurité senior qui audite du code pour des développeurs. " +
    "Réponds en français, en markdown. Structure ta réponse par sections de sévérité " +
    "dans cet ordre, en omettant les sections vides : « 🔴 Critique », « 🟠 Élevé », " +
    "« 🟡 Moyen », « 🔵 Faible ». Pour chaque problème trouvé : décris-le en une phrase, " +
    "explique pourquoi c'est un risque, et donne une piste de correction courte. " +
    "Si le code ne présente aucun problème de sécurité notable, dis-le clairement " +
    "au lieu d'inventer des problèmes. Ne réponds qu'avec l'analyse, pas de préambule.";

  const user = `Analyse ce code :\n\`\`\`\n${code}\n\`\`\``;
  return complete(userId, system, user, 900);
}

export async function suggestCodeFix(
  userId: string,
  code: string,
  findings: string,
): Promise<string> {
  const system =
    "Tu es un ingénieur senior. On te donne du code et une liste de problèmes de " +
    "sécurité identifiés dessus. Réponds UNIQUEMENT avec la version corrigée du " +
    "code dans un bloc de code, suivie d'une liste à puces très courte de ce qui " +
    "a changé. Ne réintroduis aucun des problèmes signalés. N'invente pas de " +
    "fonctionnalités qui n'existaient pas dans l'original.";

  const user = `Code original :\n\`\`\`\n${code}\n\`\`\`\n\nProblèmes identifiés :\n${findings}`;
  return complete(userId, system, user, 900);
}

// --- Threat Modeling (Phase 8) ---------------------------------------------

export async function analyzeThreatModel(userId: string, description: string): Promise<string> {
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
  return complete(userId, system, user, 800);
}

// --- Code Review qualité (Phase 7) ----------------------------------------

export async function reviewCodeQuality(userId: string, code: string): Promise<string> {
  const system =
    "Tu es un lead developer qui relit du code pour un développeur junior. " +
    "Réponds en français, en markdown, sous forme de liste à puces courte " +
    "(5 points maximum). Concentre-toi sur la lisibilité, le nommage, la " +
    "duplication, et les simplifications possibles — PAS sur la sécurité " +
    "(un autre outil s'en charge). Sois concret : cite la ligne ou l'extrait " +
    "concerné à chaque fois. Si le code est déjà propre, dis-le simplement " +
    "plutôt que d'inventer des remarques.";

  const user = `Relis ce code :\n\`\`\`\n${code}\n\`\`\``;
  return complete(userId, system, user, 700);
}

// --- Debug Coach (Phase 7) -------------------------------------------------

export async function debugGuide(
  userId: string,
  errorMessage: string,
  code: string | undefined,
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

  return complete(userId, system, user, 400);
}

export async function debugHint(
  userId: string,
  errorMessage: string,
  code: string | undefined,
  previousGuidance: string,
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

  return complete(userId, system, user, 400);
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
  return complete(userId, system, user, 600);
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
  return complete(userId, system, user, 700);
}
