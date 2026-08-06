/** Date UTC au format "YYYY-MM-DD" — évite toute ambiguïté de fuseau horaire pour les streaks. */
export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Minuit UTC du jour courant — borne basse pour les requêtes "fait aujourd'hui" (objectifs quotidiens). */
export function startOfTodayUtc(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
