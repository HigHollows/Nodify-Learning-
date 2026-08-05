-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "definition" TEXT NOT NULL,
    "explanationBeginner" TEXT NOT NULL,
    "explanationAdvanced" TEXT NOT NULL,
    "docUrl" TEXT,
    "relatedKeys" TEXT NOT NULL DEFAULT '[]',
    "prerequisiteKeys" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "concept_aliases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "term" TEXT NOT NULL,
    "conceptId" TEXT NOT NULL,
    CONSTRAINT "concept_aliases_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "concepts" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "concepts_key_key" ON "concepts"("key");

-- CreateIndex
CREATE UNIQUE INDEX "concept_aliases_term_key" ON "concept_aliases"("term");
