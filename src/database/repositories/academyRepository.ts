import { prisma } from "../client.js";

export async function listCourses() {
  return prisma.course.findMany({ orderBy: { level: "asc" } });
}

export async function findCourseByKey(key: string) {
  return prisma.course.findUnique({ where: { key } });
}

export async function findCoursesByKeys(keys: string[]) {
  if (keys.length === 0) return [];
  return prisma.course.findMany({ where: { key: { in: keys } } });
}

export async function countLessonsForCourse(courseId: string): Promise<number> {
  return prisma.lesson.count({ where: { courseId } });
}

export async function findLessonByCourseAndOrder(courseId: string, order: number) {
  return prisma.lesson.findUnique({
    where: { courseId_order: { courseId, order } },
    include: { questions: { orderBy: { order: "asc" } }, course: true },
  });
}

export async function findLessonById(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { questions: { orderBy: { order: "asc" } }, course: true },
  });
}

export async function getOrCreateCourseProgress(userId: string, courseId: string) {
  return prisma.userCourseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });
}

export async function getCourseProgress(userId: string, courseId: string) {
  return prisma.userCourseProgress.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
}

export async function advanceCourseProgress(
  userId: string,
  courseId: string,
  nextLessonOrder: number,
): Promise<void> {
  await prisma.userCourseProgress.update({
    where: { userId_courseId: { userId, courseId } },
    data: { currentLessonOrder: nextLessonOrder },
  });
}

export async function completeCourseProgress(userId: string, courseId: string): Promise<void> {
  await prisma.userCourseProgress.update({
    where: { userId_courseId: { userId, courseId } },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
}

/** Cours terminés par l'utilisateur (clé + skillKey) — utilisé pour évaluer les badges de progression (voir achievementService). */
export async function listCompletedCourses(userId: string): Promise<{ key: string; skillKey: string }[]> {
  const rows = await prisma.userCourseProgress.findMany({
    where: { userId, status: "COMPLETED" },
    include: { course: { select: { key: true, skillKey: true } } },
  });
  return rows.map((r) => ({ key: r.course.key, skillKey: r.course.skillKey }));
}

export async function upsertLessonCompletion(
  userId: string,
  lessonId: string,
  data: { score: number; totalQuestions: number; passed: boolean },
): Promise<void> {
  await prisma.userLessonCompletion.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: { userId, lessonId, ...data },
    update: { ...data, completedAt: new Date() },
  });
}

export async function addSkillXp(userId: string, skillKey: string, xp: number): Promise<void> {
  const skill = await prisma.skill.findUnique({ where: { key: skillKey } });
  if (!skill) return; // catalogue incomplet — on n'échoue pas la leçon pour autant

  await prisma.userSkill.upsert({
    where: { userId_skillId: { userId, skillId: skill.id } },
    create: { userId, skillId: skill.id, xp },
    update: { xp: { increment: xp } },
  });

  await prisma.user.update({ where: { id: userId }, data: { totalXp: { increment: xp } } });
}
