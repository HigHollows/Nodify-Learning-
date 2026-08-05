/**
 * Rate limiter en mémoire, fenêtre glissante simple (pas de fenêtre glissante
 * précise à la milliseconde — un compteur qui se réinitialise après `windowMs`
 * suffit largement pour de l'anti-abus, pas besoin d'un algorithme plus fin).
 *
 * En mémoire (pas en base) : perdre les compteurs à un redémarrage n'a aucune
 * conséquence de sécurité, juste un utilisateur qui regagne son quota plus tôt.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/** Nettoyage opportuniste pour éviter une fuite mémoire avec beaucoup d'utilisateurs distincts. */
function sweepExpired(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

let callCount = 0;

export interface RateLimitResult {
  allowed: boolean;
  /** Secondes à attendre avant de réessayer, si `allowed` est false. */
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  callCount++;
  if (callCount % 50 === 0) sweepExpired(); // pas à chaque appel, juste périodiquement

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count++;
  return { allowed: true, retryAfterSeconds: 0 };
}
