import { prisma } from "@/lib/prisma";
import type { LinkedInAccount } from "@/generated/prisma/enums";

export type AccountFilter = LinkedInAccount | "ALL";

// "ALL" (all-time) or a "YYYY-MM" calendar month, e.g. "2026-07".
export type PeriodFilter = "ALL" | string;

function accountWhere(account: AccountFilter) {
  return account === "ALL" ? {} : { account };
}

function monthRange(period: string) {
  const [y, m] = period.split("-").map(Number);
  return { gte: new Date(y, m - 1, 1), lt: new Date(y, m, 1) };
}

// True when `date` is set and (for "ALL") exists at all, or (for "YYYY-MM")
// falls within that calendar month.
function matchesPeriod(date: Date | null, period: PeriodFilter) {
  if (!date) return false;
  if (period === "ALL") return true;
  const { gte, lt } = monthRange(period);
  return date >= gte && date < lt;
}

function monthLabel(period: string) {
  const { gte } = monthRange(period);
  return gte.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Months worth offering in the period selector: any month that has actual
// lead activity or a manually-entered monthly snapshot, plus the current
// month so there's always somewhere to log today's numbers.
export async function getAvailableMonths(account: AccountFilter = "ALL") {
  const [leads, metrics] = await Promise.all([
    prisma.lead.findMany({
      where: accountWhere(account),
      select: {
        connectionRequestSentAt: true,
        connectionAcceptedAt: true,
        firstMessageSentAt: true,
        replyReceivedAt: true,
        discoveryScheduledAt: true,
        discoveryCompletedAt: true,
      },
    }),
    getOutreachMetrics(account),
  ]);

  const keys = new Set<string>();
  const now = new Date();
  keys.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);

  for (const lead of leads) {
    for (const date of [
      lead.connectionRequestSentAt,
      lead.connectionAcceptedAt,
      lead.firstMessageSentAt,
      lead.replyReceivedAt,
      lead.discoveryScheduledAt,
      lead.discoveryCompletedAt,
    ]) {
      if (date) keys.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    }
  }
  for (const m of metrics) {
    if (/^\d{4}-\d{2}$/.test(m.periodLabel)) keys.add(m.periodLabel);
  }

  return [...keys]
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({ value: key, label: monthLabel(key) }));
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

// Manually-entered numbers for one specific "YYYY-MM" month only (no
// fallback to All-Time Totals — a month with nothing logged is genuinely 0).
async function getReportedTotalsForPeriod(account: AccountFilter, periodLabel: string): Promise<MetricTotals> {
  const metrics = await getOutreachMetrics(account);
  const rows = metrics.filter((m) => m.periodLabel === periodLabel);
  return rows.length > 0 ? sumMetricRows(rows) : { ...EMPTY_TOTALS };
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

export async function getKpis(account: AccountFilter = "ALL", period: PeriodFilter = "ALL") {
  const leads = await prisma.lead.findMany({ where: accountWhere(account) });
  const reported = period === "ALL" ? await getReportedTotals(account) : await getReportedTotalsForPeriod(account, period);
  // The manual aggregate only has all-time or per-month snapshots, never
  // both — so for a specific month we only add it in if someone actually
  // logged numbers for that exact month.
  const includeReported = period === "ALL" || (await getOutreachMetrics(account)).some((m) => m.periodLabel === period);
  const r = includeReported ? reported : { ...EMPTY_TOTALS };

  const totalLeads = period === "ALL" ? leads.length : leads.filter((l) => matchesPeriod(l.createdAt, period)).length;
  const connectionRequestsSent = leads.filter((l) => matchesPeriod(l.connectionRequestSentAt, period)).length + r.requestsSent;
  const acceptedConnections = leads.filter((l) => matchesPeriod(l.connectionAcceptedAt, period)).length + r.connectionsAccepted;
  const pendingRequests = Math.max(connectionRequestsSent - acceptedConnections, 0);
  const firstMessagesSent = leads.filter((l) => matchesPeriod(l.firstMessageSentAt, period)).length + r.firstMessagesSent;
  const firstFollowupsSent = leads.filter((l) => matchesPeriod(l.firstFollowupAt, period)).length + r.firstFollowupsSent;
  const secondFollowupsSent = leads.filter((l) => matchesPeriod(l.secondFollowupAt, period)).length + r.secondFollowupsSent;
  const thirdFollowupsSent = leads.filter((l) => matchesPeriod(l.thirdFollowupAt, period)).length + r.thirdFollowupsSent;
  const repliesReceived = leads.filter((l) => matchesPeriod(l.replyReceivedAt, period)).length + r.repliesReceived;
  const positiveReplies =
    leads.filter((l) => matchesPeriod(l.replyReceivedAt, period) && l.replySentiment === "positive").length + r.positiveReplies;
  const negativeReplies =
    leads.filter((l) => matchesPeriod(l.replyReceivedAt, period) && l.replySentiment === "negative").length + r.negativeReplies;

  // Meetings Scheduled/Held are sourced purely from named lead records (each
  // backed by a real person + editable date), not blended with the legacy
  // manual aggregate — so the number on screen always matches what you can
  // edit in the Leads list.
  const discoveryScheduled = leads.filter((l) => matchesPeriod(l.discoveryScheduledAt, period)).length;
  const discoveryCompleted = leads.filter((l) => matchesPeriod(l.discoveryCompletedAt, period)).length;
  const opportunities =
    (period === "ALL"
      ? leads.filter((l) =>
          ["INTERESTED", "DISCOVERY_SCHEDULED", "DISCOVERY_COMPLETED", "PROTOTYPE_READY", "PROPOSAL_SENT", "NEGOTIATION", "CONTRACT_SENT", "CUSTOMER"].includes(
            l.currentStage
          )
        ).length
      : 0) + r.interested;
  const prototypeShared = leads.filter((l) => matchesPeriod(l.prototypeDeliveredAt, period)).length + r.prototypeShared;
  const proposalSent =
    leads.filter((l) => matchesPeriod(l.proposalSentAt, period)).length + r.proposalSent;
  const negotiation = (period === "ALL" ? leads.filter((l) => l.currentStage === "NEGOTIATION").length : 0) + r.negotiation;
  const contractSent = leads.filter((l) => matchesPeriod(l.contractSentAt, period)).length + r.contractSent;
  const contractSigned = leads.filter((l) => matchesPeriod(l.contractSignedAt, period)).length + r.contractSigned;
  const wonDeals = leads.filter((l) => matchesPeriod(l.wonAt, period)).length + r.wonDeals;
  const lostDeals = leads.filter((l) => matchesPeriod(l.lostAt, period)).length + r.lostDeals;

  const callsScheduled = leads.filter((l) => matchesPeriod(l.discoveryScheduledAt, period) || matchesPeriod(l.demoScheduledAt, period)).length;
  const callsCompleted = leads.filter((l) => matchesPeriod(l.discoveryCompletedAt, period) || matchesPeriod(l.demoCompletedAt, period)).length;

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
    orderBy: { discoveryCompletedAt: "asc" },
  });

  const groups = new Map<string, { monthLabel: string; people: { lead: (typeof leads)[number]; date: Date }[] }>();

  for (const lead of leads) {
    const date = lead.discoveryCompletedAt!;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, { monthLabel, people: [] });
    groups.get(key)!.people.push({ lead, date });
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, group]) => ({ key, ...group, count: group.people.length }));
}

export async function getAccountComparison() {
  const [kanth, shaku] = await Promise.all([getKpis("KANTH"), getKpis("SHAKU")]);
  return { KANTH: kanth, SHAKU: shaku };
}
