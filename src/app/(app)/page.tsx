import { getKpis, getSimpleFunnel, getOutreachTotals, getMonthlyMeetings, type AccountFilter } from "@/lib/queries";
import { isEditUnlocked } from "@/lib/auth";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { SimpleFunnelChart } from "@/components/dashboard/simple-funnel-chart";
import { MonthlyMeetings } from "@/components/dashboard/monthly-meetings";
import { AccountTabs } from "@/components/dashboard/account-tabs";
import { EditMetricsDialog } from "@/components/dashboard/edit-metrics-dialog";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const params = await searchParams;
  const account = (params.account === "KANTH" || params.account === "SHAKU" ? params.account : "ALL") as AccountFilter;

  const [kpis, kanthTotals, shakuTotals, canEdit, monthlyMeetings] = await Promise.all([
    getKpis(account),
    getOutreachTotals("KANTH"),
    getOutreachTotals("SHAKU"),
    isEditUnlocked(),
    getMonthlyMeetings(account),
  ]);
  const funnelData = getSimpleFunnel(kpis);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Executive overview of your LinkedIn outreach pipeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AccountTabs active={account} />
          {canEdit && (
            <>
              <EditMetricsDialog
                defaultAccount={account === "ALL" ? "KANTH" : account}
                initialTotals={{ KANTH: kanthTotals, SHAKU: shakuTotals }}
              />
              <LeadFormDialog mode="create" defaultAccount={account === "ALL" ? "KANTH" : account} />
            </>
          )}
        </div>
      </div>

      <HeroStats kpis={kpis} />

      <Card>
        <CardHeader>
          <CardTitle>Your Funnel, at a Glance</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            {account === "ALL" ? "Dr. Kanth + Shaku combined" : ""}
          </p>
        </CardHeader>
        <CardContent>
          <SimpleFunnelChart data={funnelData} />
        </CardContent>
      </Card>

      <MonthlyMeetings months={monthlyMeetings} />
    </div>
  );
}
