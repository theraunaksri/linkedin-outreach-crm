import { getLeads } from "@/lib/queries";
import { LeadsTable } from "@/components/leads/leads-table";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string; account?: string }>;
}) {
  const params = await searchParams;
  const leads = await getLeads("ALL");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CRM / Leads</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {leads.length} lead{leads.length === 1 ? "" : "s"} across both LinkedIn accounts.
        </p>
      </div>
      <LeadsTable
        leads={leads}
        initialQuery={params.q}
        initialStage={params.stage}
        initialAccount={params.account}
      />
    </div>
  );
}
