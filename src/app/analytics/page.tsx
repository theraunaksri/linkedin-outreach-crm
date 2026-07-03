import { getKpis, getFunnelMetrics, type AccountFilter } from "@/lib/queries";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { Funnel } from "@/components/dashboard/funnel";
import { AccountTabs } from "@/components/dashboard/account-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ account?: string }>;
}) {
  const params = await searchParams;
  const account = (params.account === "KANTH" || params.account === "SHAKU" ? params.account : "ALL") as AccountFilter;

  const [kpis, funnelItems] = await Promise.all([getKpis(account), getFunnelMetrics(account)]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Every number, broken all the way down.</p>
        </div>
        <AccountTabs active={account} basePath="/analytics" />
      </div>

      <KpiCards kpis={kpis} />

      <Card>
        <CardHeader>
          <CardTitle>Full Funnel Breakdown</CardTitle>
          <p className="text-xs text-muted-foreground">
            {account === "ALL" ? "Dr. Kanth + Shaku combined" : "From Edit Outreach Numbers"}
          </p>
        </CardHeader>
        <CardContent>
          <Funnel items={funnelItems} />
        </CardContent>
      </Card>
    </div>
  );
}
