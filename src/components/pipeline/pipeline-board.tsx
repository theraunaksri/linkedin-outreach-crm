"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  useDraggable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { PIPELINE_STAGES, PRIORITY_COLORS, PRIORITY_LABELS, ACCOUNT_LABELS } from "@/lib/constants";
import { updateLeadStage } from "@/lib/actions/leads";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LeadModel } from "@/generated/prisma/models";
import type { PipelineStage } from "@/generated/prisma/enums";

function LeadCard({ lead, dragging, canEdit }: { lead: LeadModel; dragging?: boolean; canEdit?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: lead.id, disabled: !canEdit });
  const style: React.CSSProperties = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : {};

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...(canEdit ? listeners : {})}
      {...(canEdit ? attributes : {})}
      className={`p-3 gap-1.5 touch-none ${canEdit ? "cursor-grab active:cursor-grabbing" : ""} ${dragging ? "opacity-40" : ""}`}
    >
      <div className="text-sm font-medium leading-tight">{lead.name}</div>
      <div className="text-xs text-muted-foreground">{lead.companyName || "—"}</div>
      <div className="flex items-center gap-1.5 mt-1">
        <Badge className={PRIORITY_COLORS[lead.priority]} variant="secondary">
          {PRIORITY_LABELS[lead.priority]}
        </Badge>
        <span className="text-[10px] text-muted-foreground">{ACCOUNT_LABELS[lead.account]}</span>
      </div>
    </Card>
  );
}

function Column({
  stage,
  label,
  leads,
  canEdit,
}: {
  stage: PipelineStage;
  label: string;
  leads: LeadModel[];
  canEdit: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, disabled: !canEdit });

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
        <Badge variant="outline" className="text-[10px]">{leads.length}</Badge>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 p-2 min-h-40 overflow-y-auto transition-colors ${isOver ? "bg-accent/50" : ""}`}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} canEdit={canEdit} />
        ))}
        {leads.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-6">No leads</div>
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({ leads, canEdit }: { leads: LeadModel[]; canEdit: boolean }) {
  const router = useRouter();
  const [items, setItems] = React.useState(leads);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  React.useEffect(() => setItems(leads), [leads]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const leadId = String(active.id);
    const newStage = over.id as PipelineStage;
    const lead = items.find((l) => l.id === leadId);
    if (!lead || lead.currentStage === newStage) return;

    setItems((prev) => prev.map((l) => (l.id === leadId ? { ...l, currentStage: newStage } : l)));

    try {
      await updateLeadStage(leadId, newStage);
      router.refresh();
    } catch {
      toast.error("Failed to move lead");
      setItems(leads);
    }
  }

  const activeLead = activeId ? items.find((l) => l.id === activeId) : null;

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((s) => (
          <Column
            key={s.value}
            stage={s.value}
            label={s.label}
            leads={items.filter((l) => l.currentStage === s.value)}
            canEdit={canEdit}
          />
        ))}
      </div>
      <DragOverlay>{activeLead ? <LeadCard lead={activeLead} dragging canEdit={canEdit} /> : null}</DragOverlay>
    </DndContext>
  );
}
