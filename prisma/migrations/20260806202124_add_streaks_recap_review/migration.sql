-- AlterTable
ALTER TABLE "daily_question_answers" ADD COLUMN "category" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN "lastStreakReminderDate" TEXT;
ALTER TABLE "users" ADD COLUMN "lastWeeklyRecapDate" TEXT;

-- CreateTable
CREATE TABLE "user_concept_views" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    "viewedAt" DATETIME NOT NULL,
    CONSTRAINT "user_concept_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_concept_views_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_concept_views_userId_conceptId_key" ON "user_concept_views"("userId", "conceptId");
