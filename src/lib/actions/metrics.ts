"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertEditUnlocked } from "@/lib/auth";
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

export async function upsertOutreachTotals(account: LinkedInAccount, data: OutreachTotalsInput, periodLabel: string = "All-Time Totals") {
  await assertEditUnlocked();
  await prisma.outreachMetric.upsert({
    where: { account_periodLabel: { account, periodLabel } },
    update: data,
    create: { account, periodLabel, ...data },
  });

  revalidatePath("/");
  revalidatePath("/leads");
}
