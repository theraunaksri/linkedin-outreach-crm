import { BarChart3 } from "lucide-react";
import { getKpis, getSimpleFunnel, getOutreachTotals, type AccountFilter } from "@/lib/queries";
import { isEditUnlocked } from "@/lib/auth";
import { HeroStats } from "@/components/dashboard/hero-stats";
import { SimpleFunnelChart } from "@/components/dashboard/simple-funnel-chart";
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

  const [kpis, funnelData, kanthTotals, shakuTotals, canEdit] = await Promise.all([
    getKpis(account),
    getSimpleFunnel(account),
    getOutreachTotals("KANTH"),
    getOutreachTotals("SHAKU"),
    isEditUnlocked(),
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Funnel, at a Glance</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {account === "ALL" ? "Dr. Kanth + Shaku combined" : ""}
            </p>
          </div>
          <LinkButton href="/analytics" variant="ghost" size="sm" className="text-muted-foreground gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" /> Full breakdown
          </LinkButton>
        </CardHeader>
        <CardContent>
          <SimpleFunnelChart data={funnelData} />
        </CardContent>
      </Card>
    </div>
  );
}
