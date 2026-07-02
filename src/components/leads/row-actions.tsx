"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { deleteLead, duplicateLead } from "@/lib/actions/leads";
import type { LeadModel } from "@/generated/prisma/models";

export function RowActions({ lead }: { lead: LeadModel }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);

  async function onDuplicate() {
    try {
      await duplicateLead(lead.id);
      toast.success("Lead duplicated");
      router.refresh();
    } catch {
      toast.error("Failed to duplicate lead");
    }
  }

  async function onDelete() {
    if (!confirm(`Delete ${lead.name}? This cannot be undone.`)) return;
    try {
      await deleteLead(lead.id);
      toast.success("Lead deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LeadFormDialog mode="edit" lead={lead} trigger={null} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
