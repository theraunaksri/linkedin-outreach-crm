import {
  getKpis,
  getSimpleFunnel,
  getOutreachMetrics,
  getMonthlyMeetings,
  getAvailableMonths,
  type AccountFilter,
  type PeriodFilter,
} from "@/lib/queries";
import { isEditUnlocked } from "@/lib/auth";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { SimpleFunnelChart } from "@/components/dashboard/simple-funnel-chart";
import { MonthlyMeetings } from "@/components/dashboard/monthly-meetings";
import { AccountTabs } from "@/components/dashboard/account-tabs";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { EditMetricsDialog } from "@/components/dashboard/edit-metrics-dialog";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OutreachTotalsInput } from "@/lib/actions/metrics";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string; month?: string }>;
}) {
  const params = await searchParams;
  const account = (params.account === "KANTH" || params.account === "SHAKU" ? params.account : "ALL") as AccountFilter;
  const month = (params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : "ALL") as PeriodFilter;

  const [kpis, kanthMetrics, shakuMetrics, canEdit, monthlyMeetings, availableMonths] = await Promise.all([
    getKpis(account, month),
    getOutreachMetrics("KANTH"),
    getOutreachMetrics("SHAKU"),
    isEditUnlocked(),
    getMonthlyMeetings(account),
    getAvailableMonths(account),
  ]);
  const funnelData = getSimpleFunnel(kpis);

  const totalsByPeriod = {
    KANTH: Object.fromEntries(kanthMetrics.map((m) => [m.periodLabel, m as OutreachTotalsInput])),
    SHAKU: Object.fromEntries(shakuMetrics.map((m) => [m.periodLabel, m as OutreachTotalsInput])),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {month === "ALL" ? "Executive overview of your LinkedIn outreach pipeline." : `Showing ${availableMonths.find((m) => m.value === month)?.label ?? month} only.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AccountTabs active={account} />
          <PeriodSelect active={month} months={availableMonths} />
          {canEdit && (
            <>
              <EditMetricsDialog
                defaultAccount={account === "ALL" ? "KANTH" : account}
                totalsByPeriod={totalsByPeriod}
                months={availableMonths}
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

      <MonthlyMeetings months={monthlyMeetings} canEdit={canEdit} />
    </div>
  );
}
