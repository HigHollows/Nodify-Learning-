import { prisma } from "../client.js";

export interface RawStats {
  totalUsers: number;
  totalXpAwarded: number;
  totalLessonsCompleted: number;
  totalCtfSolves: number;
  averageStreak: number;
  mostStartedCourse: { title: string; count: number } | null;
}

export async function getRawStats(): Promise<RawStats> {
  const [totalUsers, xpAgg, totalLessonsCompleted, totalCtfSolves, streakAgg, topCourseGroup] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.aggregate({ _sum: { totalXp: true } }),
      prisma.userLessonCompletion.count({ where: { passed: true } }),
      prisma.ctfSolve.count(),
      prisma.user.aggregate({ _avg: { currentStreak: true } }),
      prisma.userCourseProgress.groupBy({
        by: ["courseId"],
        _count: { courseId: true },
        orderBy: { _count: { courseId: "desc" } },
        take: 1,
      }),
    ]);

  let mostStartedCourse: RawStats["mostStartedCourse"] = null;
  const top = topCourseGroup[0];
  if (top) {
    const course = await prisma.course.findUnique({ where: { id: top.courseId } });
    if (course) mostStartedCourse = { title: course.title, count: top._count.courseId };
  }

  return {
    totalUsers,
    totalXpAwarded: xpAgg._sum.totalXp ?? 0,
    totalLessonsCompleted,
    totalCtfSolves,
    averageStreak: streakAgg._avg.currentStreak ?? 0,
    mostStartedCourse,
  };
}
