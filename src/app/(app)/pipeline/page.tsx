import { getLeads } from "@/lib/queries";
import { isEditUnlocked } from "@/lib/auth";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";

// Always reflect live lead data — never statically prerender this page.
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const [leads, canEdit] = await Promise.all([getLeads("ALL"), isEditUnlocked()]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {canEdit ? "Drag leads between stages to update them instantly." : "View-only. Unlock editing to move leads."}
          </p>
        </div>
        {canEdit && <LeadFormDialog mode="create" />}
      </div>
      <PipelineBoard leads={leads} canEdit={canEdit} />
    </div>
  );
}
