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

/** Minuit UTC il y a N jours — borne basse pour les requêtes "fait cette semaine" (récap hebdo). */
export function daysAgoUtc(days: number): Date {
  const d = startOfTodayUtc();
  d.setUTCDate(d.getUTCDate() - days);
  return d;
}

/** "YYYY-MM-DD" du lundi de la semaine UTC courante — clé stable pour n'envoyer le récap hebdo qu'une fois par semaine. */
export function currentWeekMondayUtc(): string {
  const d = new Date();
  const day = d.getUTCDay(); // 0 = dimanche, 1 = lundi, ...
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  return d.toISOString().slice(0, 10);
}
