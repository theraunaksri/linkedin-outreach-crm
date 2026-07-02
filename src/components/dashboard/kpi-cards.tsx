import type { getKpis } from "@/lib/queries";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Kpis = Awaited<ReturnType<typeof getKpis>>;

function fmtPct(n: number) {
  return `${n.toFixed(1)}%`;
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  const groups: { title: string; items: { label: string; value: string | number; tone?: string }[] }[] = [
    {
      title: "Pipeline Volume",
      items: [
        { label: "Total Leads", value: kpis.totalLeads },
        { label: "Connection Requests Sent", value: kpis.connectionRequestsSent },
        { label: "Pending Requests", value: kpis.pendingRequests },
        { label: "Accepted Connections", value: kpis.acceptedConnections },
        { label: "Acceptance Rate", value: fmtPct(kpis.acceptanceRate), tone: "text-emerald-600 dark:text-emerald-400" },
      ],
    },
    {
      title: "Messaging",
      items: [
        { label: "First Messages Sent", value: kpis.firstMessagesSent },
        { label: "First Follow-ups Sent", value: kpis.firstFollowupsSent },
        { label: "Second Follow-ups Sent", value: kpis.secondFollowupsSent },
        { label: "Third Follow-ups Sent", value: kpis.thirdFollowupsSent },
        { label: "Replies Received", value: kpis.repliesReceived },
        { label: "Positive Replies", value: kpis.positiveReplies, tone: "text-emerald-600 dark:text-emerald-400" },
        { label: "Negative Replies", value: kpis.negativeReplies, tone: "text-red-600 dark:text-red-400" },
        { label: "Response Rate", value: fmtPct(kpis.responseRate) },
      ],
    },
    {
      title: "Calls & Meetings",
      items: [
        { label: "Discovery Calls Scheduled", value: kpis.discoveryScheduled },
        { label: "Discovery Calls Completed", value: kpis.discoveryCompleted },
        { label: "Opportunities Created", value: kpis.opportunities },
        { label: "Prototype Shared", value: kpis.prototypeShared },
      ],
    },
    {
      title: "Deal Progress",
      items: [
        { label: "Proposal Sent", value: kpis.proposalSent },
        { label: "Negotiation", value: kpis.negotiation },
        { label: "Contract Sent", value: kpis.contractSent },
        { label: "Contract Signed", value: kpis.contractSigned },
        { label: "Won Deals", value: kpis.wonDeals, tone: "text-emerald-600 dark:text-emerald-400" },
        { label: "Lost Deals", value: kpis.lostDeals, tone: "text-red-600 dark:text-red-400" },
        { label: "Conversion Rate", value: fmtPct(kpis.conversionRate), tone: "text-emerald-600 dark:text-emerald-400" },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{group.title}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {group.items.map((item) => (
              <Card key={item.label} className="py-0 gap-0">
                <CardContent className="p-4">
                  <div className="text-[11px] font-medium text-muted-foreground leading-tight min-h-8">{item.label}</div>
                  <div className={cn("text-2xl font-semibold mt-1 tabular-nums", item.tone)}>{item.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
