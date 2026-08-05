import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { childLogger } from "../utils/logger.js";
import { AnthropicProvider } from "./providers/anthropicProvider.js";
import { StubProvider } from "./providers/stubProvider.js";
import type { AIProvider, LevelHint } from "./types.js";

const log = childLogger("aiService");

/**
 * ModelRouter minimal : un seul provider actif à la fois, choisi une fois
 * au démarrage selon la config disponible.
 */
const activeProvider: AIProvider = env.ANTHROPIC_API_KEY
  ? new AnthropicProvider(env.ANTHROPIC_API_KEY, env.ANTHROPIC_MODEL)
  : new StubProvider();

log.info(`AIService initialisé — provider actif : ${activeProvider.name}`);

export function getActiveProviderName(): string {
  return activeProvider.name;
}

async function complete(system: string, user: string, maxTokens?: number): Promise<string> {
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

export async function explainConcept(request: ExplainRequest): Promise<string> {
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

  return complete(system, user, 600);
}

// --- Security Review (Phase 7) --------------------------------------------

export async function reviewCodeSecurity(code: string): Promise<string> {
  const system =
    "Tu es un ingénieur en sécurité senior qui audite du code pour des développeurs. " +
    "Réponds en français, en markdown. Structure ta réponse par sections de sévérité " +
    "dans cet ordre, en omettant les sections vides : « 🔴 Critique », « 🟠 Élevé », " +
    "« 🟡 Moyen », « 🔵 Faible ». Pour chaque problème trouvé : décris-le en une phrase, " +
    "explique pourquoi c'est un risque, et donne une piste de correction courte. " +
    "Si le code ne présente aucun problème de sécurité notable, dis-le clairement " +
    "au lieu d'inventer des problèmes. Ne réponds qu'avec l'analyse, pas de préambule.";

  const user = `Analyse ce code :\n\`\`\`\n${code}\n\`\`\``;
  return complete(system, user, 900);
}

export async function suggestCodeFix(code: string, findings: string): Promise<string> {
  const system =
    "Tu es un ingénieur senior. On te donne du code et une liste de problèmes de " +
    "sécurité identifiés dessus. Réponds UNIQUEMENT avec la version corrigée du " +
    "code dans un bloc de code, suivie d'une liste à puces très courte de ce qui " +
    "a changé. Ne réintroduis aucun des problèmes signalés. N'invente pas de " +
    "fonctionnalités qui n'existaient pas dans l'original.";

  const user = `Code original :\n\`\`\`\n${code}\n\`\`\`\n\nProblèmes identifiés :\n${findings}`;
  return complete(system, user, 900);
}

// --- Code Review qualité (Phase 7) ----------------------------------------

export async function reviewCodeQuality(code: string): Promise<string> {
  const system =
    "Tu es un lead developer qui relit du code pour un développeur junior. " +
    "Réponds en français, en markdown, sous forme de liste à puces courte " +
    "(5 points maximum). Concentre-toi sur la lisibilité, le nommage, la " +
    "duplication, et les simplifications possibles — PAS sur la sécurité " +
    "(un autre outil s'en charge). Sois concret : cite la ligne ou l'extrait " +
    "concerné à chaque fois. Si le code est déjà propre, dis-le simplement " +
    "plutôt que d'inventer des remarques.";

  const user = `Relis ce code :\n\`\`\`\n${code}\n\`\`\``;
  return complete(system, user, 700);
}

// --- Debug Coach (Phase 7) -------------------------------------------------

export async function debugGuide(errorMessage: string, code: string | undefined): Promise<string> {
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

  return complete(system, user, 400);
}

export async function debugHint(
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

  return complete(system, user, 400);
}

// --- Documentation RAG (Phase 6) -------------------------------------------

export interface DocChunkRef {
  title: string;
  source: string;
  content: string;
}

export async function answerFromDocs(question: string, chunks: DocChunkRef[]): Promise<string> {
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
  return complete(system, user, 600);
}
