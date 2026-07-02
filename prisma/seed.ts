import { prisma } from "../src/lib/prisma";

async function main() {
  // Dr. Kanth — reported totals (pasted from existing tracking sheet, not yet
  // broken out into individual leads).
  await prisma.outreachMetric.upsert({
    where: { account_periodLabel: { account: "KANTH", periodLabel: "All-Time Totals" } },
    update: {
      requestsSent: 250,
      connectionsAccepted: 87,
      firstMessagesSent: 87,
      firstFollowupsSent: 31,
      secondFollowupsSent: 8,
      callsScheduled: 3,
      callsCompleted: 1,
    },
    create: {
      account: "KANTH",
      periodLabel: "All-Time Totals",
      requestsSent: 250,
      connectionsAccepted: 87,
      firstMessagesSent: 87,
      firstFollowupsSent: 31,
      secondFollowupsSent: 8,
      callsScheduled: 3,
      callsCompleted: 1,
    },
  });

  await prisma.outreachMetric.upsert({
    where: { account_periodLabel: { account: "KANTH", periodLabel: "Last Month (Jun 2026)" } },
    update: {
      requestsSent: 255,
      connectionsAccepted: 46,
      firstMessagesSent: 46,
      periodStart: new Date("2026-06-01"),
      periodEnd: new Date("2026-06-30"),
    },
    create: {
      account: "KANTH",
      periodLabel: "Last Month (Jun 2026)",
      requestsSent: 255,
      connectionsAccepted: 46,
      firstMessagesSent: 46,
      periodStart: new Date("2026-06-01"),
      periodEnd: new Date("2026-06-30"),
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
