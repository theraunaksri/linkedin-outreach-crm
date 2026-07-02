import { getLeads } from "@/lib/queries";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";

// Always reflect live lead data — never statically prerender this page.
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await getLeads("ALL");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Drag leads between stages to update them instantly.</p>
        </div>
        <LeadFormDialog mode="create" />
      </div>
      <PipelineBoard leads={leads} />
    </div>
  );
}
