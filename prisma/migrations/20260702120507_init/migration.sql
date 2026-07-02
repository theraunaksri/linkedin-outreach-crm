-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "designation" TEXT,
    "linkedinUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "city" TEXT,
    "industry" TEXT,
    "startupStage" TEXT,
    "fundingStatus" TEXT,
    "companySize" TEXT,
    "source" TEXT,
    "account" TEXT NOT NULL DEFAULT 'KANTH',
    "leadOwner" TEXT,
    "currentStage" TEXT NOT NULL DEFAULT 'NEW_LEAD',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "connectionRequestSentAt" DATETIME,
    "connectionAcceptedAt" DATETIME,
    "firstMessageSentAt" DATETIME,
    "firstFollowupAt" DATETIME,
    "secondFollowupAt" DATETIME,
    "thirdFollowupAt" DATETIME,
    "replyReceivedAt" DATETIME,
    "replySentiment" TEXT,
    "discoveryScheduledAt" DATETIME,
    "discoveryCompletedAt" DATETIME,
    "demoScheduledAt" DATETIME,
    "demoCompletedAt" DATETIME,
    "prototypeRequestedAt" DATETIME,
    "prototypeDeliveredAt" DATETIME,
    "meetingScheduled" BOOLEAN NOT NULL DEFAULT false,
    "meetingDate" DATETIME,
    "proposalStatus" TEXT NOT NULL DEFAULT 'NONE',
    "proposalSentAt" DATETIME,
    "contractStatus" TEXT NOT NULL DEFAULT 'NONE',
    "contractSentAt" DATETIME,
    "contractSignedAt" DATETIME,
    "probabilityOfClosing" INTEGER,
    "wonAt" DATETIME,
    "lostAt" DATETIME,
    "lastActivityDate" DATETIME,
    "nextFollowupDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "author" TEXT,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "durationMin" INTEGER,
    "meetingType" TEXT,
    "outcome" TEXT,
    "notes" TEXT,
    "nextAction" TEXT,
    "followUpDate" DATETIME,
    "recordingUrl" TEXT,
    "owner" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT,
    "title" TEXT NOT NULL,
    "owner" TEXT,
    "dueDate" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutreachMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "periodStart" DATETIME,
    "periodEnd" DATETIME,
    "requestsSent" INTEGER NOT NULL DEFAULT 0,
    "connectionsAccepted" INTEGER NOT NULL DEFAULT 0,
    "firstMessagesSent" INTEGER NOT NULL DEFAULT 0,
    "firstFollowupsSent" INTEGER NOT NULL DEFAULT 0,
    "secondFollowupsSent" INTEGER NOT NULL DEFAULT 0,
    "thirdFollowupsSent" INTEGER NOT NULL DEFAULT 0,
    "repliesReceived" INTEGER NOT NULL DEFAULT 0,
    "positiveReplies" INTEGER NOT NULL DEFAULT 0,
    "negativeReplies" INTEGER NOT NULL DEFAULT 0,
    "callsScheduled" INTEGER NOT NULL DEFAULT 0,
    "callsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Lead_account_idx" ON "Lead"("account");

-- CreateIndex
CREATE INDEX "Lead_currentStage_idx" ON "Lead"("currentStage");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachMetric_account_periodLabel_key" ON "OutreachMetric"("account", "periodLabel");
