-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OutreachMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "requestsSent" INTEGER NOT NULL DEFAULT 0,
    "connectionsAccepted" INTEGER NOT NULL DEFAULT 0,
    "conversationStarted" INTEGER NOT NULL DEFAULT 0,
    "engaged" INTEGER NOT NULL DEFAULT 0,
    "interested" INTEGER NOT NULL DEFAULT 0,
    "firstMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "firstFollowupsSent" INTEGER NOT NULL DEFAULT 0,
    "secondFollowupsSent" INTEGER NOT NULL DEFAULT 0,
    "thirdFollowupsSent" INTEGER NOT NULL DEFAULT 0,
    "repliesReceived" INTEGER NOT NULL DEFAULT 0,
    "positiveReplies" INTEGER NOT NULL DEFAULT 0,
    "negativeReplies" INTEGER NOT NULL DEFAULT 0,
    "callsScheduled" INTEGER NOT NULL DEFAULT 0,
    "callsCompleted" INTEGER NOT NULL DEFAULT 0,
    "prototypeShared" INTEGER NOT NULL DEFAULT 0,
    "proposalSent" INTEGER NOT NULL DEFAULT 0,
    "negotiation" INTEGER NOT NULL DEFAULT 0,
    "contractSent" INTEGER NOT NULL DEFAULT 0,
    "contractSigned" INTEGER NOT NULL DEFAULT 0,
    "wonDeals" INTEGER NOT NULL DEFAULT 0,
    "lostDeals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_OutreachMetric" ("account", "callsCompleted", "callsScheduled", "connectionsAccepted", "createdAt", "firstFollowupsSent", "firstMessagesSent", "id", "negativeReplies", "periodEnd", "periodLabel", "periodStart", "positiveReplies", "repliesReceived", "requestsSent", "secondFollowupsSent", "thirdFollowupsSent", "updatedAt") SELECT "account", "callsCompleted", "callsScheduled", "connectionsAccepted", "createdAt", "firstFollowupsSent", "firstMessagesSent", "id", "negativeReplies", "periodEnd", "periodLabel", "periodStart", "positiveReplies", "repliesReceived", "requestsSent", "secondFollowupsSent", "thirdFollowupsSent", "updatedAt" FROM "OutreachMetric";
DROP TABLE "OutreachMetric";
ALTER TABLE "new_OutreachMetric" RENAME TO "OutreachMetric";
CREATE UNIQUE INDEX "OutreachMetric_account_periodLabel_key" ON "OutreachMetric"("account", "periodLabel");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
