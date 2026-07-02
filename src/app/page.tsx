import { getKpis, getFunnelMetrics, getOutreachTotals, type AccountFilter } from "@/lib/queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { Funnel } from "@/components/dashboard/funnel";
import { AccountTabs } from "@/components/dashboard/account-tabs";
import { EditMetricsDialog } from "@/components/dashboard/edit-metrics-dialog";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const params = await searchParams;
  const account = (params.account === "KANTH" || params.account === "SHAKU" ? params.account : "ALL") as AccountFilter;

  const [kpis, funnelItems, kanthTotals, shakuTotals] = await Promise.all([
    getKpis(account),
    getFunnelMetrics(account),
    getOutreachTotals("KANTH"),
    getOutreachTotals("SHAKU"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Executive overview of your LinkedIn outreach pipeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AccountTabs active={account} />
          <EditMetricsDialog
            defaultAccount={account === "ALL" ? "KANTH" : account}
            initialTotals={{ KANTH: kanthTotals, SHAKU: shakuTotals }}
          />
          <LeadFormDialog mode="create" defaultAccount={account === "ALL" ? "KANTH" : account} />
        </div>
      </div>

      <KpiCards kpis={kpis} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Outreach Funnel</CardTitle>
            <p className="text-xs text-muted-foreground">
              {account === "ALL" ? "Dr. Kanth + Shaku combined" : "Numbers you entered in Edit Outreach Numbers"}
            </p>
          </CardHeader>
          <CardContent>
            <Funnel items={funnelItems} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Use <span className="font-medium text-foreground">Edit Outreach Numbers</span> to update bulk counts
              (requests sent, connected, conversations, replies, deals) — the funnel and KPI cards read straight from
              those.
            </p>
            <p>
              Use <span className="font-medium text-foreground">Add Lead</span> only for people you want full CRM
              details on — not every person you messaged.
            </p>
            <div className="flex gap-2 pt-1">
              <LinkButton href="/leads" size="sm" variant="outline">
                Open CRM Table
              </LinkButton>
              <LinkButton href="/pipeline" size="sm" variant="outline">
                Open Pipeline Board
              </LinkButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
