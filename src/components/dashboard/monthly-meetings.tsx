"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import type { getMonthlyMeetings } from "@/lib/queries";
import type { LeadModel } from "@/generated/prisma/models";

type MonthlyMeetings = Awaited<ReturnType<typeof getMonthlyMeetings>>;

export function MonthlyMeetings({ months, canEdit }: { months: MonthlyMeetings; canEdit: boolean }) {
  const [editingLead, setEditingLead] = React.useState<LeadModel | null>(null);

  if (months.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meetings by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No meetings marked complete yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meetings by Month</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">Who we met, grouped by month held.</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {months.map((month) => (
          <div key={month.key} className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">{month.monthLabel}</h3>
              <Badge variant="secondary">{month.count} meeting{month.count === 1 ? "" : "s"}</Badge>
            </div>
            <ul className="space-y-2">
              {month.people.map((p) => (
                <li key={p.lead.id} className="flex items-center justify-between text-sm gap-2">
                  <span className="font-medium truncate">
                    {p.lead.name}
                    {p.lead.companyName && <span className="text-muted-foreground font-normal"> · {p.lead.companyName}</span>}
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {p.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6"
                        onClick={() => setEditingLead(p.lead)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </CardContent>

      {editingLead && (
        <LeadFormDialog
          mode="edit"
          lead={editingLead}
          trigger={null}
          open={!!editingLead}
          onOpenChange={(open) => !open && setEditingLead(null)}
        />
      )}
    </Card>
  );
}
