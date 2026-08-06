import { listConceptsForSearch } from "../database/repositories/conceptRepository.js";
import { listCourses } from "../database/repositories/academyRepository.js";
import { listCtfChallenges } from "../database/repositories/ctfRepository.js";
import { listExercises } from "../database/repositories/exerciseRepository.js";
import { similarity } from "../utils/textDistance.js";

export type SearchResultType = "concept" | "course" | "ctf" | "exercise";

export interface SearchResult {
  type: SearchResultType;
  key: string;
  title: string;
  subtitle: string;
  hint: string; // comment consulter/utiliser ce résultat (commande à taper)
}

const MAX_RESULTS = 12;
/** En dessous, on ne considère même pas que le titre "ressemble" à la requête (typo). */
const TITLE_TYPO_THRESHOLD = 0.6;

/**
 * Score de pertinence d'un item pour une requête, 0 (rien) à 3 (meilleur) :
 * substring exact dans le titre > titre proche (typo) > substring dans le
 * corps (description/prompt/définition). Pas de recherche sémantique
 * (embeddings) — voir la même limite documentée pour le dictionnaire
 * (conceptService.ts) : pas d'API d'embeddings publique disponible.
 */
function relevance(query: string, title: string, body: string): number {
  const q = query.toLowerCase();
  const t = title.toLowerCase();

  if (t.includes(q)) return t.startsWith(q) ? 3 : 2.5;
  if (similarity(q, t) >= TITLE_TYPO_THRESHOLD) return 2;
  if (body.toLowerCase().includes(q)) return 1;
  return 0;
}

/** Recherche floue unifiée à travers dictionnaire, cours, CTF et exercices. */
export async function searchAll(rawQuery: string): Promise<SearchResult[]> {
  const query = rawQuery.trim();
  if (!query) return [];

  const [concepts, courses, challenges, exercises] = await Promise.all([
    listConceptsForSearch(),
    listCourses(),
    listCtfChallenges(),
    listExercises(),
  ]);

  const results: (SearchResult & { score: number })[] = [];

  for (const c of concepts) {
    const score = relevance(query, c.name, c.definition);
    if (score > 0) {
      results.push({
        type: "concept",
        key: c.key,
        title: c.name,
        subtitle: c.category,
        hint: `/dictionary terme:${c.key}`,
        score,
      });
    }
  }

  for (const c of courses) {
    const score = relevance(query, c.title, c.description);
    if (score > 0) {
      results.push({
        type: "course",
        key: c.key,
        title: c.title,
        subtitle: `${c.category} · Niveau ${c.level}`,
        hint: `/learn cours:${c.key}`,
        score,
      });
    }
  }

  for (const c of challenges) {
    const score = relevance(query, c.title, c.description);
    if (score > 0) {
      results.push({
        type: "ctf",
        key: c.key,
        title: c.title,
        subtitle: `${c.category} · ${c.points} pts`,
        hint: `/cyber ctf challenge cle:${c.key}`,
        score,
      });
    }
  }

  for (const e of exercises) {
    const score = relevance(query, e.title, e.prompt);
    if (score > 0) {
      results.push({
        type: "exercise",
        key: e.key,
        title: e.title,
        subtitle: `${e.type === "MCQ" ? "QCM" : "Debug/Complète le code"} · ${e.category}`,
        hint: `/exercise practice cle:${e.key}`,
        score,
      });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map(({ score, ...rest }) => rest);
}
