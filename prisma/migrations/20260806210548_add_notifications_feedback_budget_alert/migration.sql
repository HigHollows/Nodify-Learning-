-- AlterTable
ALTER TABLE "guild_configs" ADD COLUMN "lastAiBudgetAlertDate" TEXT;
ALTER TABLE "guild_configs" ADD COLUMN "lastAiBudgetAlertMonth" TEXT;

-- CreateTable
CREATE TABLE "feedback_reports" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "feedback_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "lastStreakReminderDate" TEXT,
    "lastWeeklyRecapDate" TEXT,
    "notifStreakReminders" BOOLEAN NOT NULL DEFAULT true,
    "notifWeeklyRecap" BOOLEAN NOT NULL DEFAULT true,
    "isSupporter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "currentStreak", "id", "isSupporter", "lastActiveDate", "lastStreakReminderDate", "lastWeeklyRecapDate", "longestStreak", "totalXp", "updatedAt", "username") SELECT "createdAt", "currentStreak", "id", "isSupporter", "lastActiveDate", "lastStreakReminderDate", "lastWeeklyRecapDate", "longestStreak", "totalXp", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
