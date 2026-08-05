import { answerFromDocs, getActiveProviderName } from "../ai/aiService.js";
import { listAllDocChunks } from "../database/repositories/docsRepository.js";
import { similarity } from "../utils/textDistance.js";

/**
 * "RAG-lite" : retrieval par mots-clés (avec tolérance aux fautes via
 * Levenshtein), pas par embeddings/similarité vectorielle. Anthropic
 * n'expose pas d'API d'embeddings publique — une vraie recherche
 * sémantique demanderait un provider dédié (OpenAI, Cohere, un modèle
 * local...). Si un jour on en ajoute un, seul `findRelevantChunks`
 * change ; `answerDocsQuestion` et la commande /docs n'ont pas à bouger.
 */
const FUZZY_WORD_MATCH_THRESHOLD = 0.75;
const MIN_RELEVANCE_SCORE = 1;
const MAX_CHUNKS = 3;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 3); // ignore les mots trop courts (bruit : "de", "un"...)
}

function scoreChunk(queryWords: string[], haystack: string): number {
  const haystackWords = tokenize(haystack);
  let score = 0;
  for (const queryWord of queryWords) {
    const matched = haystackWords.some(
      (word) => similarity(queryWord, word) >= FUZZY_WORD_MATCH_THRESHOLD,
    );
    if (matched) score++;
  }
  return score;
}

export interface DocSearchResult {
  title: string;
  source: string;
  url: string;
  content: string;
  score: number;
}

export async function findRelevantChunks(
  query: string,
  limit = MAX_CHUNKS,
): Promise<DocSearchResult[]> {
  const queryWords = tokenize(query);
  if (queryWords.length === 0) return [];

  const chunks = await listAllDocChunks();

  return chunks
    .map((chunk) => ({ ...chunk, score: scoreChunk(queryWords, `${chunk.title} ${chunk.content}`) }))
    .filter((result) => result.score >= MIN_RELEVANCE_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export interface DocsAnswer {
  /** null si le provider actif est le stub : pas d'appel IA inutile, on montre juste les sources brutes. */
  synthesized: string | null;
  sources: DocSearchResult[];
}

export async function answerDocsQuestion(userId: string, question: string): Promise<DocsAnswer> {
  const sources = await findRelevantChunks(question);
  if (sources.length === 0) {
    return { synthesized: null, sources: [] };
  }

  if (getActiveProviderName() === "stub") {
    return { synthesized: null, sources };
  }

  const synthesized = await answerFromDocs(
    userId,
    question,
    sources.map((s) => ({ title: s.title, source: s.source, content: s.content })),
  );

  return { synthesized, sources };
}
