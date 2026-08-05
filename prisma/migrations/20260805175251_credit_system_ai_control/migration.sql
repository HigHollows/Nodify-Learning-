-- CreateTable
CREATE TABLE "user_credit_accounts" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "totalEarned" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "totalRefunded" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_credit_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "credit_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "reason" TEXT NOT NULL,
    "feature" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reward_claims" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rewardType" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "claimedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAvailableAt" DATETIME NOT NULL,
    CONSTRAINT "reward_claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_calls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT,
    "feature" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT,
    "status" TEXT NOT NULL,
    "creditCost" INTEGER NOT NULL,
    "refunded" BOOLEAN NOT NULL DEFAULT false,
    "tokensInput" INTEGER,
    "tokensOutput" INTEGER,
    "latencyMs" INTEGER,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "aiMode" TEXT NOT NULL DEFAULT 'OPEN',
    "maintenanceReason" TEXT,
    "maintenanceSince" DATETIME,
    "statusChannelId" TEXT,
    "statusMessageId" TEXT,
    "lastSuccessfulRequestAt" DATETIME,
    "lastErrorAt" DATETIME,
    "lastErrorMessage" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetUserId" TEXT,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "credit_transactions_userId_idx" ON "credit_transactions"("userId");

-- CreateIndex
CREATE INDEX "reward_claims_userId_rewardType_idx" ON "reward_claims"("userId", "rewardType");

-- CreateIndex
CREATE INDEX "ai_calls_feature_idx" ON "ai_calls"("feature");

-- CreateIndex
CREATE INDEX "ai_calls_createdAt_idx" ON "ai_calls"("createdAt");
