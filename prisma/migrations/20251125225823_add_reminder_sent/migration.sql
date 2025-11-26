-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReputationQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_ReputationQuestion" ("channelId", "createdAt", "id", "messageId", "resolved", "userId") SELECT "channelId", "createdAt", "id", "messageId", "resolved", "userId" FROM "ReputationQuestion";
DROP TABLE "ReputationQuestion";
ALTER TABLE "new_ReputationQuestion" RENAME TO "ReputationQuestion";
CREATE UNIQUE INDEX "ReputationQuestion_messageId_key" ON "ReputationQuestion"("messageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
