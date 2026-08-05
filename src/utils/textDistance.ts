/**
 * Distance de Levenshtein entre deux chaînes — nombre minimal d'insertions/
 * suppressions/substitutions pour passer de `a` à `b`.
 *
 * Utilisé pour la recherche floue du dictionnaire (fautes de frappe) sans
 * dépendre d'un modèle IA — la vraie recherche sémantique (embeddings)
 * viendra avec le RAG en Phase 6.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousRow = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 0; i < a.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const insertCost = currentRow[j]! + 1;
      const deleteCost = previousRow[j + 1]! + 1;
      const substituteCost = previousRow[j]! + (a[i] === b[j] ? 0 : 1);
      currentRow.push(Math.min(insertCost, deleteCost, substituteCost));
    }
    previousRow = currentRow;
  }

  return previousRow[b.length]!;
}

/**
 * Similarité normalisée entre 0 (rien en commun) et 1 (identique), basée
 * sur la distance de Levenshtein rapportée à la longueur de la plus longue
 * chaîne. Plus pratique qu'une distance brute pour fixer un seuil unique
 * qui fonctionne aussi bien sur des mots courts que longs.
 */
export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshteinDistance(a, b) / maxLen;
}
