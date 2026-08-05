-- AlterTable
ALTER TABLE "guild_configs" ADD COLUMN "maxDailyAiSpend" INTEGER;
ALTER TABLE "guild_configs" ADD COLUMN "maxMonthlyAiSpend" INTEGER;

-- AlterTable
ALTER TABLE "system_config" ADD COLUMN "lastErrorCode" TEXT;
ALTER TABLE "system_config" ADD COLUMN "lastNotifiedStatus" TEXT;

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
    "isSupporter" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "currentStreak", "id", "lastActiveDate", "longestStreak", "totalXp", "updatedAt", "username") SELECT "createdAt", "currentStreak", "id", "lastActiveDate", "longestStreak", "totalXp", "updatedAt", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
