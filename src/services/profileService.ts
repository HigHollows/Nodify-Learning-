import { countAchievements } from "../database/repositories/achievementRepository.js";
import { listTopUsersByXp } from "../database/repositories/userRepository.js";
import { SKILL_CATEGORY_LABELS, type SkillCategory } from "../types/skill.js";
import { levelForXp, progressBar, type LevelInfo } from "../utils/leveling.js";
import { getProfile } from "./userService.js";

export interface ProfileSkillView {
  name: string;
  categoryLabel: string;
  level: LevelInfo;
}

export interface ProfileAchievementView {
  icon: string;
  name: string;
  earnedAt: Date;
}

export interface ProfileView {
  username: string;
  level: LevelInfo;
  xpBar: string;
  currentStreak: number;
  longestStreak: number;
  skills: ProfileSkillView[];
  achievements: ProfileAchievementView[];
  achievementsUnlockedCount: number;
  achievementsTotalCount: number;
  duelsWon: number;
  duelsPlayed: number;
}

/**
 * Assemble la vue complète du profil pour /profile.
 * Centralise la mise en forme (labels, barre de progression) pour que
 * d'autres futures commandes (ex: un futur /leaderboard) puissent réutiliser
 * les mêmes briques sans redupliquer la logique de présentation.
 */
export async function buildProfileView(discordId: string): Promise<ProfileView | null> {
  const profile = await getProfile(discordId);
  if (!profile) return null;

  const level = levelForXp(profile.totalXp);
  const achievementsTotalCount = await countAchievements();

  return {
    username: profile.username,
    level,
    xpBar: progressBar(level.xpIntoLevel, level.xpForNextLevel ?? level.xpIntoLevel),
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    skills: profile.skills.map((s) => ({
      name: s.skill.name,
      categoryLabel: SKILL_CATEGORY_LABELS[s.skill.category as SkillCategory],
      level: levelForXp(s.xp),
    })),
    achievements: profile.achievements.map((a) => ({
      icon: a.achievement.icon,
      name: a.achievement.name,
      earnedAt: a.earnedAt,
    })),
    achievementsUnlockedCount: profile.achievements.length,
    achievementsTotalCount,
    duelsWon: profile.duelsWon,
    duelsPlayed: profile.duelsPlayed,
  };
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  totalXp: number;
  levelName: string;
}

/** Classement global par XP (toutes guildes confondues — profil Nodify global). */
export async function buildLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
  const users = await listTopUsersByXp(limit);

  return users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    totalXp: user.totalXp,
    levelName: levelForXp(user.totalXp).name,
  }));
}
