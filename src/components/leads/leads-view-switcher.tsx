"use client";

import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeadsTable } from "@/components/leads/leads-table";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import type { LeadModel } from "@/generated/prisma/models";

export function LeadsViewSwitcher({
  leads,
  canEdit,
  initialQuery,
  initialStage,
  initialAccount,
}: {
  leads: LeadModel[];
  canEdit: boolean;
  initialQuery?: string;
  initialStage?: string;
  initialAccount?: string;
}) {
  const [view, setView] = React.useState<"table" | "board">("table");

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as "table" | "board")}>
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="board">Board</TabsTrigger>
        </TabsList>
        {view === "board" && canEdit && <LeadFormDialog mode="create" />}
      </div>

      <TabsContent value="table">
        <LeadsTable
          leads={leads}
          initialQuery={initialQuery}
          initialStage={initialStage}
          initialAccount={initialAccount}
          canEdit={canEdit}
        />
      </TabsContent>

      <TabsContent value="board">
        <p className="text-sm text-muted-foreground mb-3">
          {canEdit ? "Drag leads between stages to update them instantly." : "View-only. Unlock editing to move leads."}
        </p>
        <PipelineBoard leads={leads} canEdit={canEdit} />
      </TabsContent>
    </Tabs>
  );
}
