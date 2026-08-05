-- CreateTable
CREATE TABLE "guilds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "guild_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "academyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cyberEnabled" BOOLEAN NOT NULL DEFAULT true,
    "newsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "managedChannelIds" TEXT NOT NULL DEFAULT '[]',
    "managedRoleIds" TEXT NOT NULL DEFAULT '[]',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "guild_configs_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "guilds" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "guild_configs_guildId_key" ON "guild_configs"("guildId");
