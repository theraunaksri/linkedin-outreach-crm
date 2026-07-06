"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Upload, Trash2, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { RowActions } from "@/components/leads/row-actions";
import {
  ACCOUNT_LABELS,
  ACCOUNTS,
  PIPELINE_STAGES,
  STAGE_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/constants";
import { bulkDeleteLeads, importLeadsCsv, type LeadInput } from "@/lib/actions/leads";
import type { LeadModel } from "@/generated/prisma/models";
import type { LinkedInAccount, PipelineStage, Priority, LeadStatus } from "@/generated/prisma/enums";

const PAGE_SIZE = 20;

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function csvEscape(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const parseLine = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        cells.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells;
  };
  const headers = parseLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export function LeadsTable({
  leads,
  initialQuery,
  initialStage,
  initialAccount,
  canEdit,
}: {
  leads: LeadModel[];
  initialQuery?: string;
  initialStage?: string;
  initialAccount?: string;
  canEdit: boolean;
}) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [query, setQuery] = React.useState(initialQuery ?? "");
  const [account, setAccount] = React.useState<LinkedInAccount | "ALL">(
    (initialAccount as LinkedInAccount) && ACCOUNTS.includes(initialAccount as LinkedInAccount)
      ? (initialAccount as LinkedInAccount)
      : "ALL"
  );
  const [stage, setStage] = React.useState<PipelineStage | "ALL">(
    (initialStage as PipelineStage) && PIPELINE_STAGES.some((s) => s.value === initialStage)
      ? (initialStage as PipelineStage)
      : "ALL"
  );
  const [priority, setPriority] = React.useState<Priority | "ALL">("ALL");
  const [status, setStatus] = React.useState<LeadStatus | "ALL">("ALL");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((l) => {
      if (account !== "ALL" && l.account !== account) return false;
      if (stage !== "ALL" && l.currentStage !== stage) return false;
      if (priority !== "ALL" && l.priority !== priority) return false;
      if (status !== "ALL" && l.status !== status) return false;
      if (!q) return true;
      const haystack = [
        l.name,
        l.companyName,
        l.industry,
        l.country,
        l.linkedinUrl,
        l.email,
        l.phone,
        l.notes,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [leads, query, account, stage, priority, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const allPageSelected = pageItems.length > 0 && pageItems.every((l) => selected.has(l.id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageItems.forEach((l) => next.delete(l.id));
      } else {
        pageItems.forEach((l) => next.add(l.id));
      }
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onBulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} lead(s)? This cannot be undone.`)) return;
    try {
      await bulkDeleteLeads([...selected]);
      toast.success(`${selected.size} lead(s) deleted`);
      setSelected(new Set());
      router.refresh();
    } catch {
      toast.error("Failed to delete leads");
    }
  }

  function exportCsv() {
    const headers = [
      "name",
      "companyName",
      "designation",
      "linkedinUrl",
      "email",
      "phone",
      "country",
      "city",
      "industry",
      "startupStage",
      "fundingStatus",
      "companySize",
      "source",
      "account",
      "leadOwner",
      "currentStage",
      "priority",
      "status",
      "probabilityOfClosing",
      "nextFollowupDate",
      "lastActivityDate",
      "notes",
    ];
    const rows = filtered.map((l) =>
      headers
        .map((h) => {
          const v = (l as unknown as Record<string, unknown>)[h];
          if (v instanceof Date) return csvEscape(v.toISOString().slice(0, 10));
          return csvEscape(v);
        })
        .join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    const inputs: LeadInput[] = rows
      .filter((r) => r.name?.trim())
      .map((r) => ({
        name: r.name,
        companyName: r.companyName,
        designation: r.designation,
        linkedinUrl: r.linkedinUrl,
        email: r.email,
        phone: r.phone,
        country: r.country,
        city: r.city,
        industry: r.industry,
        startupStage: r.startupStage,
        fundingStatus: r.fundingStatus,
        companySize: r.companySize,
        source: r.source,
        account: (ACCOUNTS.includes(r.account as LinkedInAccount) ? r.account : "KANTH") as LinkedInAccount,
        leadOwner: r.leadOwner,
        currentStage: (PIPELINE_STAGES.some((s) => s.value === r.currentStage) ? r.currentStage : "NEW_LEAD") as PipelineStage,
        priority: (["LOW", "MEDIUM", "HIGH"].includes(r.priority) ? r.priority : "MEDIUM") as Priority,
        status: (["ACTIVE", "PAUSED", "WON", "LOST"].includes(r.status) ? r.status : "ACTIVE") as LeadStatus,
        probabilityOfClosing: r.probabilityOfClosing ? Number(r.probabilityOfClosing) : null,
        nextFollowupDate: r.nextFollowupDate,
        lastActivityDate: r.lastActivityDate,
        notes: r.notes,
      }));

    if (inputs.length === 0) {
      toast.error("No valid rows found in CSV (a 'name' column is required)");
      return;
    }

    try {
      await importLeadsCsv(inputs);
      toast.success(`Imported ${inputs.length} lead(s)`);
      router.refresh();
    } catch {
      toast.error("Import failed");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search leads..."
            className="pl-8 h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={account} onValueChange={(v) => { setAccount(v as typeof account); setPage(1); }}>
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue>{(v: typeof account) => (v === "ALL" ? "All Accounts" : ACCOUNT_LABELS[v])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Accounts</SelectItem>
              {ACCOUNTS.map((a) => (
                <SelectItem key={a} value={a}>{ACCOUNT_LABELS[a]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stage} onValueChange={(v) => { setStage(v as typeof stage); setPage(1); }}>
            <SelectTrigger className="h-9 w-full sm:w-44">
              <SelectValue>{(v: typeof stage) => (v === "ALL" ? "All Stages" : STAGE_LABELS[v])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stages</SelectItem>
              {PIPELINE_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={(v) => { setPriority(v as typeof priority); setPage(1); }}>
            <SelectTrigger className="h-9 w-full sm:w-32">
              <SelectValue>{(v: typeof priority) => (v === "ALL" ? "Priority" : PRIORITY_LABELS[v])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Priority</SelectItem>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(1); }}>
            <SelectTrigger className="h-9 w-full sm:w-32">
              <SelectValue>{(v: typeof status) => (v === "ALL" ? "Status" : STATUS_LABELS[v])}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Status</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canEdit && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Import
              </Button>
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={onImportFile} />
            </>
          )}

          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export
          </Button>

          {canEdit && <LeadFormDialog mode="create" defaultAccount={account === "ALL" ? "KANTH" : account} />}
        </div>
      </div>

      {canEdit && selected.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
            <Button variant="destructive" size="sm" className="gap-1.5" onClick={onBulkDelete}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {canEdit && (
                <TableHead className="w-10">
                  <Checkbox checked={allPageSelected} onCheckedChange={toggleAll} />
                </TableHead>
              )}
              <TableHead>Lead</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Next Follow-up</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Status</TableHead>
              {canEdit && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={canEdit ? 10 : 8} className="h-32 text-center text-sm text-muted-foreground">
                  No leads match these filters.
                  {canEdit && (
                    <>
                      {" "}Click <span className="font-medium text-foreground">Add Lead</span> to create one.
                    </>
                  )}
                </TableCell>
              </TableRow>
            )}
            {pageItems.map((lead) => (
              <TableRow key={lead.id} data-state={selected.has(lead.id) ? "selected" : undefined}>
                {canEdit && (
                  <TableCell>
                    <Checkbox checked={selected.has(lead.id)} onCheckedChange={() => toggleRow(lead.id)} />
                  </TableCell>
                )}
                <TableCell>
                  <div className="font-medium">{lead.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[lead.companyName, lead.designation].filter(Boolean).join(" · ") || "—"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="whitespace-nowrap">
                    {STAGE_LABELS[lead.currentStage]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={PRIORITY_COLORS[lead.priority]} variant="secondary">
                    {PRIORITY_LABELS[lead.priority]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {ACCOUNT_LABELS[lead.account]}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{lead.leadOwner || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {fmtDate(lead.nextFollowupDate)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {lead.probabilityOfClosing != null ? `${lead.probabilityOfClosing}%` : "—"}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_COLORS[lead.status]} variant="secondary">
                    {STATUS_LABELS[lead.status]}
                  </Badge>
                </TableCell>
                {canEdit && (
                  <TableCell>
                    <RowActions lead={lead} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {pageSafe} of {totalPages} · {filtered.length} lead(s)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={pageSafe <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={pageSafe >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
