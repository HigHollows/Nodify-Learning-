import { prisma } from "../client.js";

/**
 * Crée le User s'il n'existe pas encore, ou met simplement à jour son
 * username (peut changer côté Discord entre deux interactions).
 * Retourne aussi `isNew` pour permettre de déclencher des effets de bord
 * (ex: achievement "Bienvenue") uniquement à la toute première interaction.
 */
export async function getOrCreateUser(discordId: string, username: string) {
  const existing = await prisma.user.findUnique({ where: { id: discordId } });

  if (existing) {
    if (existing.username !== username) {
      await prisma.user.update({ where: { id: discordId }, data: { username } });
    }
    return { user: existing, isNew: false };
  }

  const user = await prisma.user.create({ data: { id: discordId, username } });
  return { user, isNew: true };
}

export async function updateStreak(
  discordId: string,
  data: { currentStreak: number; longestStreak: number; lastActiveDate: string },
) {
  return prisma.user.update({ where: { id: discordId }, data });
}

export async function getUserProfile(discordId: string) {
  return prisma.user.findUnique({
    where: { id: discordId },
    include: {
      skills: { include: { skill: true }, orderBy: { xp: "desc" } },
      achievements: { include: { achievement: true }, orderBy: { earnedAt: "asc" } },
    },
  });
}

/**
 * Top utilisateurs par XP globale (toutes guildes confondues — le profil
 * Nodify est global, voir Phase 3). Le filtrage à l'affichage aux seuls
 * membres présents sur la guild courante se fait côté commande, pas ici.
 */
export async function listTopUsersByXp(limit: number) {
  return prisma.user.findMany({
    where: { totalXp: { gt: 0 } },
    orderBy: { totalXp: "desc" },
    take: limit,
  });
}

/**
 * Statut "supporter" non-monétaire (attribué par un admin, pas acheté — les
 * crédits ne sont pas une monnaie réelle). Donne un bonus sur la récompense
 * MONTHLY — voir rewardService.ts.
 */
export async function setSupporterStatus(discordId: string, isSupporter: boolean): Promise<void> {
  await prisma.user.update({ where: { id: discordId }, data: { isSupporter } });
}

export async function isSupporter(discordId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: discordId }, select: { isSupporter: true } });
  return user?.isSupporter ?? false;
}

/**
 * Utilisateurs avec un streak actif qui ne l'ont pas encore prolongé
 * aujourd'hui (dernière activité = hier) et pas encore été relancés
 * aujourd'hui — voir progression/streakReminderService.ts.
 */
export async function listUsersAtRiskOfLosingStreak(yesterday: string, today: string) {
  return prisma.user.findMany({
    where: {
      currentStreak: { gt: 0 },
      lastActiveDate: yesterday,
      notifStreakReminders: true,
      // `NOT: { lastStreakReminderDate: today }` exclurait à tort les
      // utilisateurs jamais relancés (colonne NULL) : en SQL, `NULL <> x`
      // vaut NULL (pas vrai), donc ces lignes seraient silencieusement
      // écartées. `OR [null, <> today]` les inclut explicitement.
      OR: [{ lastStreakReminderDate: null }, { lastStreakReminderDate: { not: today } }],
    },
    select: { id: true, currentStreak: true },
  });
}

export async function markStreakReminderSent(userId: string, today: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { lastStreakReminderDate: today } });
}

/** Utilisateurs pas encore relancés pour le récap hebdo de cette semaine (voir progression/weeklyRecapService.ts). */
export async function listUsersForWeeklyRecap(weekKey: string) {
  return prisma.user.findMany({
    where: {
      totalXp: { gt: 0 }, // pas la peine de spammer un compte jamais actif pédagogiquement
      notifWeeklyRecap: true,
      // Même piège NULL que listUsersAtRiskOfLosingStreak ci-dessus.
      OR: [{ lastWeeklyRecapDate: null }, { lastWeeklyRecapDate: { not: weekKey } }],
    },
    select: { id: true },
  });
}

/** Enregistre l'issue d'un duel terminé — voir social/duelService.ts (état de la partie elle-même reste en mémoire, non persisté). */
export async function recordDuelWin(winnerId: string, loserId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: winnerId }, data: { duelsWon: { increment: 1 }, duelsPlayed: { increment: 1 } } }),
    prisma.user.update({ where: { id: loserId }, data: { duelsPlayed: { increment: 1 } } }),
  ]);
}

export async function recordDuelDraw(userAId: string, userBId: string): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userAId }, data: { duelsPlayed: { increment: 1 } } }),
    prisma.user.update({ where: { id: userBId }, data: { duelsPlayed: { increment: 1 } } }),
  ]);
}

export async function setNotificationPreferences(
  userId: string,
  updates: { notifStreakReminders?: boolean; notifWeeklyRecap?: boolean },
): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: updates });
}

export async function getNotificationPreferences(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notifStreakReminders: true, notifWeeklyRecap: true },
  });
  return user ?? { notifStreakReminders: true, notifWeeklyRecap: true };
}

export async function markWeeklyRecapSent(userId: string, weekKey: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { lastWeeklyRecapDate: weekKey } });
}

/**
 * Réponses à la question du jour groupées par catégorie — alimente
 * l'analyse "points faibles" (voir progression/weakSpotsService.ts).
 * Les réponses données avant l'ajout du champ `category` (nullable) sont
 * exclues via le `where`, pas comptées comme un faux 0.
 */
export async function getDailyAnswerStatsByCategory(userId: string) {
  return prisma.dailyQuestionAnswer.groupBy({
    by: ["category"],
    where: { userId, category: { not: null } },
    _count: { _all: true },
  });
}

export async function getDailyAnswerCorrectCountByCategory(userId: string) {
  return prisma.dailyQuestionAnswer.groupBy({
    by: ["category"],
    where: { userId, category: { not: null }, correct: true },
    _count: { _all: true },
  });
}

/**
 * Scores de leçons Academy agrégés par catégorie de cours — même usage
 * "points faibles". Une jointure via `lesson.course.category` n'est pas
 * exprimable directement en `groupBy` Prisma sur SQLite, donc on récupère
 * les lignes et on agrège en mémoire (volume par utilisateur toujours petit).
 */
export async function listLessonScoresWithCourseCategory(userId: string) {
  return prisma.userLessonCompletion.findMany({
    where: { userId },
    select: { score: true, totalQuestions: true, lesson: { select: { course: { select: { category: true } } } } },
  });
}

/** Agrège l'activité des 7 derniers jours pour le récap hebdo — voir progression/weeklyRecapService.ts. */
export async function getWeeklyRecapStats(userId: string, since: Date) {
  const [lessons, ctfSolves, exercises, achievements, user] = await Promise.all([
    prisma.userLessonCompletion.count({ where: { userId, passed: true, completedAt: { gte: since } } }),
    prisma.ctfSolve.count({ where: { userId, solvedAt: { gte: since } } }),
    prisma.userExerciseCompletion.count({ where: { userId, solvedAt: { gte: since } } }),
    prisma.userAchievement.findMany({
      where: { userId, earnedAt: { gte: since } },
      include: { achievement: { select: { name: true, icon: true } } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true } }),
  ]);

  return {
    lessonsCompleted: lessons,
    ctfSolved: ctfSolves,
    exercisesSolved: exercises,
    achievementsUnlocked: achievements.map((a) => ({ name: a.achievement.name, icon: a.achievement.icon })),
    currentStreak: user?.currentStreak ?? 0,
  };
}
