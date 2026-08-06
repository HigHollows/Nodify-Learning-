/**
 * Le contenu écrit à la main (Academy + Question du jour) avait un biais
 * réel : la bonne réponse tombait sur l'option B (index 1) dans ~80% des
 * questions — trivial à deviner sans réfléchir. Plutôt que de réécrire à la
 * main des centaines de questions (risque d'erreur, corpus qui continue de
 * grandir), on mélange l'ordre des choix à l'affichage, de façon
 * déterministe à partir d'un identifiant stable de la question.
 *
 * Déterministe = même clé → même mélange à chaque appel, sans rien stocker
 * nulle part : l'affichage (boutons) et la vérification de réponse (qui
 * re-fetch la question séparément en DB) recalculent chacun le même mélange
 * indépendamment et restent donc toujours synchronisés.
 */

/** Petit PRNG seedé par une chaîne (mulberry32 sur un hash de la clé) — suffisant pour un mélange, pas pour de la crypto. */
function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export interface ShuffledChoices {
  choices: string[];
  correctIndex: number;
}

/** Réordonne les choix d'une question, en recalculant l'index de la bonne réponse dans le nouvel ordre. */
export function shuffleChoices(seedKey: string, choices: string[], correctIndex: number): ShuffledChoices {
  const rand = seededRandom(seedKey);
  const order = choices.map((_, i) => i);

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j]!, order[i]!];
  }

  return {
    choices: order.map((i) => choices[i]!),
    correctIndex: order.indexOf(correctIndex),
  };
}
