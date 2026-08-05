-- CreateTable
CREATE TABLE "daily_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "choices" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "daily_question_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_question_answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_guild_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "academyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cyberEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "dailyQuestionEnabled" BOOLEAN NOT NULL DEFAULT true,
    "lastDailyQuestionDate" TEXT,
    "lastDailyQuestionKey" TEXT,
    "managedChannelIds" TEXT NOT NULL DEFAULT '{}',
    "managedRoleIds" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "guild_configs_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_guild_configs" ("academyEnabled", "cyberEnabled", "guildId", "id", "managedChannelIds", "managedRoleIds", "newsEnabled", "updatedAt") SELECT "academyEnabled", "cyberEnabled", "guildId", "id", "managedChannelIds", "managedRoleIds", "newsEnabled", "updatedAt" FROM "guild_configs";
DROP TABLE "guild_configs";
ALTER TABLE "new_guild_configs" RENAME TO "guild_configs";
CREATE UNIQUE INDEX "guild_configs_guildId_key" ON "guild_configs"("guildId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "daily_questions_key_key" ON "daily_questions"("key");

-- CreateIndex
CREATE UNIQUE INDEX "daily_question_answers_userId_guildId_date_key" ON "daily_question_answers"("userId", "guildId", "date");
