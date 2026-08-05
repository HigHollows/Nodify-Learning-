import { getRawStats } from "../database/repositories/statsRepository.js";

export interface NodifyStats {
  totalUsers: number;
  totalXpAwarded: number;
  totalLessonsCompleted: number;
  totalCtfSolves: number;
  averageStreak: number;
  mostStartedCourseTitle: string | null;
  mostStartedCourseCount: number;
}

export async function getNodifyStats(): Promise<NodifyStats> {
  const raw = await getRawStats();

  return {
    totalUsers: raw.totalUsers,
    totalXpAwarded: raw.totalXpAwarded,
    totalLessonsCompleted: raw.totalLessonsCompleted,
    totalCtfSolves: raw.totalCtfSolves,
    averageStreak: Math.round(raw.averageStreak * 10) / 10,
    mostStartedCourseTitle: raw.mostStartedCourse?.title ?? null,
    mostStartedCourseCount: raw.mostStartedCourse?.count ?? 0,
  };
}
