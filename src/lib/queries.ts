import { prisma } from "@/lib/prisma";
import type { LinkedInAccount } from "@/generated/prisma/enums";

export type AccountFilter = LinkedInAccount | "ALL";

function accountWhere(account: AccountFilter) {
  return account === "ALL" ? {} : { account };
}

export async function getLeads(account: AccountFilter = "ALL") {
  return prisma.lead.findMany({
    where: accountWhere(account),
    orderBy: { updatedAt: "desc" },
  });
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { leadNotes: { orderBy: { createdAt: "desc" } }, calls: true, tasks: true },
  });
}

export async function getOutreachMetrics(account: AccountFilter = "ALL") {
  return prisma.outreachMetric.findMany({
    where: account === "ALL" ? {} : { account },
    orderBy: { createdAt: "desc" },
  });
}

const EMPTY_TOTALS = {
  requestsSent: 0,
  connectionsAccepted: 0,
  conversationStarted: 0,
  engaged: 0,
  interested: 0,
  firstMessagesSent: 0,
  firstFollowupsSent: 0,
  secondFollowupsSent: 0,
  thirdFollowupsSent: 0,
  repliesReceived: 0,
  positiveReplies: 0,
  negativeReplies: 0,
  callsScheduled: 0,
  callsCompleted: 0,
  prototypeShared: 0,
  proposalSent: 0,
  negotiation: 0,
  contractSent: 0,
  contractSigned: 0,
  wonDeals: 0,
  lostDeals: 0,
};

type MetricTotals = typeof EMPTY_TOTALS;
const METRIC_KEYS = Object.keys(EMPTY_TOTALS) as (keyof MetricTotals)[];

function sumMetricRows(rows: Partial<MetricTotals>[]): MetricTotals {
  const totals = { ...EMPTY_TOTALS };
  for (const row of rows) {
    for (const key of METRIC_KEYS) {
      totals[key] += row[key] ?? 0;
    }
  }
  return totals;
}

export async function getOutreachTotals(account: LinkedInAccount) {
  const record = await prisma.outreachMetric.findUnique({
    where: { account_periodLabel: { account, periodLabel: "All-Time Totals" } },
  });
  return record ?? { ...EMPTY_TOTALS, account };
}

// Reported totals (edited via "Edit Outreach Numbers") are additive per
// account, so when viewing "All Accounts" we must sum Dr. Kanth's and
// Shaku's "All-Time Totals" rows together rather than picking just one.
async function getReportedTotals(account: AccountFilter): Promise<MetricTotals> {
  const metrics = await getOutreachMetrics(account);
  const totalsRows = metrics.filter((m) => m.periodLabel === "All-Time Totals");
  if (totalsRows.length > 0) return sumMetricRows(totalsRows);
  // Fall back to whatever periods exist (e.g. only a "Last Month" snapshot
  // was entered) rather than showing zero.
  return sumMetricRows(metrics);
}

// A rolled-up funnel for the dashboard home page, derived from the same
// Kpis object as the hero stat cards so the two never disagree. Deals/won
// stages are intentionally left out for now — not this month's goal, and
// the team hasn't reached that part of the pipeline yet.
export function getSimpleFunnel(kpis: Awaited<ReturnType<typeof getKpis>>) {
  return [
    { name: "Connection Request Sent", value: kpis.connectionRequestsSent, fill: "#3b82f6" },
    { name: "Connected", value: kpis.acceptedConnections, fill: "#6366f1" },
    { name: "Replied", value: kpis.repliesReceived, fill: "#06b6d4" },
    { name: "Meetings Scheduled", value: kpis.discoveryScheduled, fill: "#f97316" },
    { name: "Meetings Held", value: kpis.discoveryCompleted, fill: "#f59e0b" },
  ];
}

export async function getKpis(account: AccountFilter = "ALL") {
  const leads = await prisma.lead.findMany({ where: accountWhere(account) });
  const reported = await getReportedTotals(account);

  const totalLeads = leads.length;
  const connectionRequestsSent = leads.filter((l) => l.connectionRequestSentAt).length + reported.requestsSent;
  const acceptedConnections = leads.filter((l) => l.connectionAcceptedAt).length + reported.connectionsAccepted;
  const pendingRequests = Math.max(connectionRequestsSent - acceptedConnections, 0);
  const firstMessagesSent = leads.filter((l) => l.firstMessageSentAt).length + reported.firstMessagesSent;
  const firstFollowupsSent = leads.filter((l) => l.firstFollowupAt).length + reported.firstFollowupsSent;
  const secondFollowupsSent = leads.filter((l) => l.secondFollowupAt).length + reported.secondFollowupsSent;
  const thirdFollowupsSent = leads.filter((l) => l.thirdFollowupAt).length + reported.thirdFollowupsSent;
  const repliesReceived = leads.filter((l) => l.replyReceivedAt).length + reported.repliesReceived;
  const positiveReplies = leads.filter((l) => l.replySentiment === "positive").length + reported.positiveReplies;
  const negativeReplies = leads.filter((l) => l.replySentiment === "negative").length + reported.negativeReplies;

  const discoveryScheduled = leads.filter((l) => l.discoveryScheduledAt).length + reported.callsScheduled;
  const discoveryCompleted = leads.filter((l) => l.discoveryCompletedAt).length + reported.callsCompleted;
  const opportunities =
    leads.filter((l) =>
      ["INTERESTED", "DISCOVERY_SCHEDULED", "DISCOVERY_COMPLETED", "PROTOTYPE_READY", "PROPOSAL_SENT", "NEGOTIATION", "CONTRACT_SENT", "CUSTOMER"].includes(
        l.currentStage
      )
    ).length + reported.interested;
  const prototypeShared = leads.filter((l) => l.prototypeDeliveredAt).length + reported.prototypeShared;
  const proposalSent =
    leads.filter((l) => l.proposalSentAt || l.proposalStatus === "SENT" || l.proposalStatus === "VIEWED" || l.proposalStatus === "APPROVED").length +
    reported.proposalSent;
  const negotiation = leads.filter((l) => l.currentStage === "NEGOTIATION").length + reported.negotiation;
  const contractSent = leads.filter((l) => l.contractSentAt || l.contractStatus === "SENT").length + reported.contractSent;
  const contractSigned = leads.filter((l) => l.contractStatus === "SIGNED").length + reported.contractSigned;
  const wonDeals = leads.filter((l) => l.status === "WON").length + reported.wonDeals;
  const lostDeals = leads.filter((l) => l.status === "LOST").length + reported.lostDeals;

  const callsScheduled = leads.filter((l) => l.discoveryScheduledAt || l.demoScheduledAt).length + reported.callsScheduled;
  const callsCompleted = leads.filter((l) => l.discoveryCompletedAt || l.demoCompletedAt).length + reported.callsCompleted;

  const acceptanceRate = connectionRequestsSent > 0 ? (acceptedConnections / connectionRequestsSent) * 100 : 0;
  const responseRate = firstMessagesSent > 0 ? (repliesReceived / firstMessagesSent) * 100 : 0;
  const closedTotal = wonDeals + lostDeals;
  const conversionRate = closedTotal > 0 ? (wonDeals / closedTotal) * 100 : totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

  return {
    totalLeads,
    connectionRequestsSent,
    pendingRequests,
    acceptedConnections,
    acceptanceRate,
    firstMessagesSent,
    firstFollowupsSent,
    secondFollowupsSent,
    thirdFollowupsSent,
    repliesReceived,
    positiveReplies,
    negativeReplies,
    responseRate,
    discoveryScheduled,
    discoveryCompleted,
    opportunities,
    prototypeShared,
    proposalSent,
    negotiation,
    contractSent,
    contractSigned,
    wonDeals,
    lostDeals,
    conversionRate,
    callsScheduled,
    callsCompleted,
  };
}

// Named people whose meeting actually happened (discoveryCompletedAt set),
// grouped by calendar month — "who, and how many, this month vs last."
export async function getMonthlyMeetings(account: AccountFilter = "ALL") {
  const leads = await prisma.lead.findMany({
    where: { ...accountWhere(account), discoveryCompletedAt: { not: null } },
    select: { name: true, companyName: true, discoveryCompletedAt: true },
    orderBy: { discoveryCompletedAt: "asc" },
  });

  const groups = new Map<string, { monthLabel: string; people: { name: string; companyName: string | null; date: Date }[] }>();

  for (const lead of leads) {
    const date = lead.discoveryCompletedAt!;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, { monthLabel, people: [] });
    groups.get(key)!.people.push({ name: lead.name, companyName: lead.companyName, date });
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({ key, ...group, count: group.people.length }));
}

export async function getAccountComparison() {
  const [kanth, shaku] = await Promise.all([getKpis("KANTH"), getKpis("SHAKU")]);
  return { KANTH: kanth, SHAKU: shaku };
}
