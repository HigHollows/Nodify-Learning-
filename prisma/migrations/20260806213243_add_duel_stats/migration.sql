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
    "duelsWon" INTEGER NOT NULL DEFAULT 0,
    "duelsPlayed" INTEGER NOT NULL DEFAULT 0,
    "isSupporter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "currentStreak", "id", "isSupporter", "lastActiveDate", "lastStreakReminderDate", "lastWeeklyRecapDate", "longestStreak", "notifStreakReminders", "notifWeeklyRecap", "totalXp", "updatedAt", "username") SELECT "createdAt", "currentStreak", "id", "isSupporter", "lastActiveDate", "lastStreakReminderDate", "lastWeeklyRecapDate", "longestStreak", "notifStreakReminders", "notifWeeklyRecap", "totalXp", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
