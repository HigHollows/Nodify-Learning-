import {
  findAliasTerm,
  findConceptByKey,
  findConceptsByKeys,
  listAliasesLite,
  listConceptsLite,
  recordConceptView as recordConceptViewRepo,
} from "../database/repositories/conceptRepository.js";
import { similarity } from "../utils/textDistance.js";

/** En dessous de ce seuil de similarité, on ne propose même pas la suggestion. */
const FUZZY_SUGGESTION_THRESHOLD = 0.6;
/** Au-dessus de ce seuil, on considère que c'est la bonne réponse (simple faute de frappe). */
const FUZZY_AUTO_MATCH_THRESHOLD = 0.85;
const MAX_SUGGESTIONS = 3;

export interface ConceptSummary {
  key: string;
  name: string;
}

export interface ConceptDetail {
  key: string;
  name: string;
  category: string;
  levelOrder: number;
  definition: string;
  explanationBeginner: string;
  explanationAdvanced: string;
  docUrl: string | null;
  related: ConceptSummary[];
  prerequisites: ConceptSummary[];
}

export type ConceptResolution =
  | { type: "exact"; concept: ConceptDetail }
  | { type: "suggestions"; query: string; suggestions: ConceptSummary[] }
  | { type: "not_found"; query: string };

function parseKeys(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function normalize(query: string): string {
  return query.trim().toLowerCase();
}

type ConceptRow = NonNullable<Awaited<ReturnType<typeof findConceptByKey>>>;

async function toDetail(concept: ConceptRow): Promise<ConceptDetail> {
  const relatedKeys = parseKeys(concept.relatedKeys);
  const prerequisiteKeys = parseKeys(concept.prerequisiteKeys);

  const [related, prerequisites] = await Promise.all([
    findConceptsByKeys(relatedKeys),
    findConceptsByKeys(prerequisiteKeys),
  ]);

  return {
    key: concept.key,
    name: concept.name,
    category: concept.category,
    levelOrder: concept.level,
    definition: concept.definition,
    explanationBeginner: concept.explanationBeginner,
    explanationAdvanced: concept.explanationAdvanced,
    docUrl: concept.docUrl,
    related: related.map((c) => ({ key: c.key, name: c.name })),
    prerequisites: prerequisites.map((c) => ({ key: c.key, name: c.name })),
  };
}

/**
 * Résout une recherche utilisateur vers un concept.
 * Ordre : clé exacte → alias exact → nom exact → recherche floue (fautes de frappe).
 */
export async function resolveConcept(rawQuery: string): Promise<ConceptResolution> {
  const query = normalize(rawQuery);
  if (!query) return { type: "not_found", query: rawQuery };

  const byKey = await findConceptByKey(query);
  if (byKey) return { type: "exact", concept: await toDetail(byKey) };

  const byAlias = await findAliasTerm(query);
  if (byAlias) return { type: "exact", concept: await toDetail(byAlias.concept) };

  const [concepts, aliases] = await Promise.all([listConceptsLite(), listAliasesLite()]);

  const byExactName = concepts.find((c) => c.name.toLowerCase() === query);
  if (byExactName) {
    const full = await findConceptByKey(byExactName.key);
    if (full) return { type: "exact", concept: await toDetail(full) };
  }

  // Recherche floue : chaque candidat (nom de concept, clé, ou alias) est
  // noté par similarité avec la requête ; tous ramènent à une `key` de concept.
  const candidates: { key: string; label: string }[] = [
    ...concepts.map((c) => ({ key: c.key, label: c.name })),
    ...concepts.map((c) => ({ key: c.key, label: c.key })),
    ...aliases.map((a) => ({ key: a.conceptKey, label: a.term })),
  ];

  const scored = candidates
    .map((c) => ({ ...c, score: similarity(query, c.label.toLowerCase()) }))
    .filter((c) => c.score >= FUZZY_SUGGESTION_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { type: "not_found", query: rawQuery };

  const best = scored[0]!;
  if (best.score >= FUZZY_AUTO_MATCH_THRESHOLD) {
    const concept = await findConceptByKey(best.key);
    if (concept) return { type: "exact", concept: await toDetail(concept) };
  }

  const seenKeys = new Set<string>();
  const suggestions: ConceptSummary[] = [];
  for (const candidate of scored) {
    if (seenKeys.has(candidate.key)) continue;
    seenKeys.add(candidate.key);
    const concept = concepts.find((c) => c.key === candidate.key);
    if (concept) suggestions.push({ key: concept.key, name: concept.name });
    if (suggestions.length >= MAX_SUGGESTIONS) break;
  }

  return { type: "suggestions", query: rawQuery, suggestions };
}

export async function getConceptDetail(key: string): Promise<ConceptDetail | null> {
  const concept = await findConceptByKey(key);
  if (!concept) return null;
  return toDetail(concept);
}

/**
 * Enregistre qu'un utilisateur a consulté ce concept — alimente la révision
 * espacée (/review, voir progression/spacedRepetitionService.ts). Best-effort :
 * ne fait jamais échouer l'affichage du concept si l'enregistrement rate.
 */
export async function recordConceptView(userId: string, key: string): Promise<void> {
  const concept = await findConceptByKey(key);
  if (!concept) return;
  await recordConceptViewRepo(userId, concept.id);
}
