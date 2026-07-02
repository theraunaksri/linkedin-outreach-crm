"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { LinkedInAccount } from "@/generated/prisma/enums";

export type OutreachTotalsInput = {
  requestsSent: number;
  connectionsAccepted: number;
  conversationStarted: number;
  engaged: number;
  interested: number;
  firstMessagesSent: number;
  firstFollowupsSent: number;
  secondFollowupsSent: number;
  thirdFollowupsSent: number;
  repliesReceived: number;
  positiveReplies: number;
  negativeReplies: number;
  callsScheduled: number;
  callsCompleted: number;
  prototypeShared: number;
  proposalSent: number;
  negotiation: number;
  contractSent: number;
  contractSigned: number;
  wonDeals: number;
  lostDeals: number;
};

const TOTALS_LABEL = "All-Time Totals";

export async function upsertOutreachTotals(account: LinkedInAccount, data: OutreachTotalsInput) {
  await prisma.outreachMetric.upsert({
    where: { account_periodLabel: { account, periodLabel: TOTALS_LABEL } },
    update: data,
    create: { account, periodLabel: TOTALS_LABEL, ...data },
  });

  revalidatePath("/");
  revalidatePath("/leads");
}
