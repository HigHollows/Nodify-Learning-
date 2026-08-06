import { listConceptsDueForReview, recordConceptView } from "../database/repositories/conceptRepository.js";
import { daysAgoUtc } from "../utils/date.js";

/** En dessous de ce délai depuis la dernière consultation, un concept est "trop frais" pour être reproposé. */
const REVIEW_DELAY_DAYS = 3;
const REVIEW_BATCH_SIZE = 5;

export interface ReviewConcept {
  key: string;
  name: string;
  definition: string;
}

/**
 * Renvoie jusqu'à 5 concepts déjà consultés il y a au moins 3 jours, du
 * plus ancien au plus récent — et marque leur consultation à MAINTENANT
 * (voir recordConceptView) pour que le prochain `/review` ramène des
 * concepts différents plutôt que de reproposer sans cesse les mêmes.
 */
export async function getConceptsDueForReview(userId: string): Promise<ReviewConcept[]> {
  const rows = await listConceptsDueForReview(userId, daysAgoUtc(REVIEW_DELAY_DAYS), REVIEW_BATCH_SIZE);

  for (const row of rows) {
    await recordConceptView(userId, row.conceptId);
  }

  return rows.map((r) => ({ key: r.concept.key, name: r.concept.name, definition: r.concept.definition }));
}
