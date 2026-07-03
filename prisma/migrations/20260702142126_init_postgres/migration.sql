-- CreateEnum
CREATE TYPE "LinkedInAccount" AS ENUM ('KANTH', 'SHAKU');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('ACTIVE', 'PAUSED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "PipelineStage" AS ENUM ('NEW_LEAD', 'CONNECTION_SENT', 'CONNECTED', 'CONVERSATION_STARTED', 'ENGAGED', 'INTERESTED', 'DISCOVERY_SCHEDULED', 'DISCOVERY_COMPLETED', 'PROTOTYPE_READY', 'PROPOSAL_SENT', 'NEGOTIATION', 'CONTRACT_SENT', 'CUSTOMER', 'LOST');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('NONE', 'CREATED', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('NONE', 'DRAFTED', 'SENT', 'PENDING', 'SIGNED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
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
    "account" "LinkedInAccount" NOT NULL DEFAULT 'KANTH',
    "leadOwner" TEXT,
    "currentStage" "PipelineStage" NOT NULL DEFAULT 'NEW_LEAD',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "LeadStatus" NOT NULL DEFAULT 'ACTIVE',
    "connectionRequestSentAt" TIMESTAMP(3),
    "connectionAcceptedAt" TIMESTAMP(3),
    "firstMessageSentAt" TIMESTAMP(3),
    "firstFollowupAt" TIMESTAMP(3),
    "secondFollowupAt" TIMESTAMP(3),
    "thirdFollowupAt" TIMESTAMP(3),
    "replyReceivedAt" TIMESTAMP(3),
    "replySentiment" TEXT,
    "discoveryScheduledAt" TIMESTAMP(3),
    "discoveryCompletedAt" TIMESTAMP(3),
    "demoScheduledAt" TIMESTAMP(3),
    "demoCompletedAt" TIMESTAMP(3),
    "prototypeRequestedAt" TIMESTAMP(3),
    "prototypeDeliveredAt" TIMESTAMP(3),
    "meetingScheduled" BOOLEAN NOT NULL DEFAULT false,
    "meetingDate" TIMESTAMP(3),
    "proposalStatus" "ProposalStatus" NOT NULL DEFAULT 'NONE',
    "proposalSentAt" TIMESTAMP(3),
    "contractStatus" "ContractStatus" NOT NULL DEFAULT 'NONE',
    "contractSentAt" TIMESTAMP(3),
    "contractSignedAt" TIMESTAMP(3),
    "probabilityOfClosing" INTEGER,
    "wonAt" TIMESTAMP(3),
    "lostAt" TIMESTAMP(3),
    "lastActivityDate" TIMESTAMP(3),
    "nextFollowupDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "author" TEXT,
    "body" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallLog" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER,
    "meetingType" TEXT,
    "outcome" TEXT,
    "notes" TEXT,
    "nextAction" TEXT,
    "followUpDate" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "title" TEXT NOT NULL,
    "owner" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachMetric" (
    "id" TEXT NOT NULL,
    "account" "LinkedInAccount" NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_account_idx" ON "Lead"("account");

-- CreateIndex
CREATE INDEX "Lead_currentStage_idx" ON "Lead"("currentStage");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OutreachMetric_account_periodLabel_key" ON "OutreachMetric"("account", "periodLabel");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallLog" ADD CONSTRAINT "CallLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
