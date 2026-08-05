-- CreateTable
CREATE TABLE "ctf_challenges" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hint" TEXT,
    "points" INTEGER NOT NULL,
    "acceptedAnswers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ctf_solves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "solvedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ctf_solves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ctf_solves_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "ctf_challenges" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "posted_news_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guid" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "postedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ctf_challenges_key_key" ON "ctf_challenges"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ctf_solves_userId_challengeId_key" ON "ctf_solves"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "posted_news_articles_guid_key" ON "posted_news_articles"("guid");
