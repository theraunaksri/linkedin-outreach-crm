"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createLead, updateLead, type LeadInput } from "@/lib/actions/leads";
import { ACCOUNT_LABELS, ACCOUNTS, PIPELINE_STAGES, PRIORITY_LABELS, STATUS_LABELS, STAGE_LABELS } from "@/lib/constants";
import type { LeadModel } from "@/generated/prisma/models";

const emptyForm: LeadInput = {
  name: "",
  companyName: "",
  designation: "",
  linkedinUrl: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  industry: "",
  startupStage: "",
  fundingStatus: "",
  companySize: "",
  source: "",
  account: "KANTH",
  leadOwner: "",
  currentStage: "NEW_LEAD",
  priority: "MEDIUM",
  status: "ACTIVE",
  probabilityOfClosing: null,
  meetingScheduled: false,
  meetingDate: "",
  nextFollowupDate: "",
  lastActivityDate: "",
  notes: "",
};

function toDateInput(d?: Date | string | null) {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function leadToForm(lead: LeadModel): LeadInput {
  return {
    name: lead.name,
    companyName: lead.companyName ?? "",
    designation: lead.designation ?? "",
    linkedinUrl: lead.linkedinUrl ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    country: lead.country ?? "",
    city: lead.city ?? "",
    industry: lead.industry ?? "",
    startupStage: lead.startupStage ?? "",
    fundingStatus: lead.fundingStatus ?? "",
    companySize: lead.companySize ?? "",
    source: lead.source ?? "",
    account: lead.account,
    leadOwner: lead.leadOwner ?? "",
    currentStage: lead.currentStage,
    priority: lead.priority,
    status: lead.status,
    proposalStatus: lead.proposalStatus,
    contractStatus: lead.contractStatus,
    probabilityOfClosing: lead.probabilityOfClosing,
    meetingScheduled: lead.meetingScheduled,
    meetingDate: toDateInput(lead.meetingDate),
    nextFollowupDate: toDateInput(lead.nextFollowupDate),
    lastActivityDate: toDateInput(lead.lastActivityDate),
    notes: lead.notes ?? "",
  };
}

export function LeadFormDialog({
  mode,
  lead,
  defaultAccount,
  defaultStage,
  trigger,
  open: openProp,
  onOpenChange: onOpenChangeProp,
}: {
  mode: "create" | "edit";
  lead?: LeadModel;
  defaultAccount?: LeadInput["account"];
  defaultStage?: LeadInput["currentStage"];
  trigger?: React.ReactElement | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = onOpenChangeProp ?? setInternalOpen;

  const [form, setForm] = React.useState<LeadInput>(() =>
    lead
      ? leadToForm(lead)
      : { ...emptyForm, account: defaultAccount ?? "KANTH", currentStage: defaultStage ?? "NEW_LEAD" }
  );
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setForm(
        lead
          ? leadToForm(lead)
          : { ...emptyForm, account: defaultAccount ?? "KANTH", currentStage: defaultStage ?? "NEW_LEAD" }
      );
    }
  }, [open, lead, defaultAccount, defaultStage]);

  function set<K extends keyof LeadInput>(key: K, value: LeadInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Lead name is required");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "create") {
        await createLead(form);
        toast.success("Lead added");
      } else if (lead) {
        await updateLead(lead.id, form);
        toast.success("Lead updated");
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const triggerNode: React.ReactElement | null =
    trigger !== undefined
      ? trigger
      : (
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerNode &&
        React.cloneElement(triggerNode, {
          onClick: (e: React.MouseEvent) => {
            (triggerNode.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
            setOpen(true);
          },
        } as React.HTMLAttributes<HTMLElement>)}
      <DialogContent className="sm:max-w-2xl p-0 gap-0">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[85vh]">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{mode === "create" ? "Add New Lead" : "Edit Lead"}</DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Add a lead to the outreach pipeline." : "Update this lead's details."}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 min-h-0 px-6">
            <div className="grid grid-cols-2 gap-4 pb-4">
              <div className="col-span-2">
                <Label className="mb-1.5">Lead Name *</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Jane Doe" />
              </div>

              <div>
                <Label className="mb-1.5">Company Name</Label>
                <Input value={form.companyName ?? ""} onChange={(e) => set("companyName", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Designation</Label>
                <Input value={form.designation ?? ""} onChange={(e) => set("designation", e.target.value)} />
              </div>

              <div className="col-span-2">
                <Label className="mb-1.5">LinkedIn Profile URL</Label>
                <Input value={form.linkedinUrl ?? ""} onChange={(e) => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/..." />
              </div>

              <div>
                <Label className="mb-1.5">Email</Label>
                <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Phone Number</Label>
                <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
              </div>

              <div>
                <Label className="mb-1.5">Country</Label>
                <Input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">City</Label>
                <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
              </div>

              <div>
                <Label className="mb-1.5">Industry</Label>
                <Input value={form.industry ?? ""} onChange={(e) => set("industry", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Startup Stage</Label>
                <Input value={form.startupStage ?? ""} onChange={(e) => set("startupStage", e.target.value)} placeholder="Seed, Series A..." />
              </div>

              <div>
                <Label className="mb-1.5">Funding Status</Label>
                <Input value={form.fundingStatus ?? ""} onChange={(e) => set("fundingStatus", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Company Size</Label>
                <Input value={form.companySize ?? ""} onChange={(e) => set("companySize", e.target.value)} placeholder="1-10, 11-50..." />
              </div>

              <div>
                <Label className="mb-1.5">Source</Label>
                <Input value={form.source ?? ""} onChange={(e) => set("source", e.target.value)} placeholder="LinkedIn Search, Referral..." />
              </div>
              <div>
                <Label className="mb-1.5">Lead Owner</Label>
                <Input value={form.leadOwner ?? ""} onChange={(e) => set("leadOwner", e.target.value)} />
              </div>

              <div>
                <Label className="mb-1.5">LinkedIn Account</Label>
                <Select value={form.account} onValueChange={(v) => set("account", v as LeadInput["account"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: LeadInput["account"]) => ACCOUNT_LABELS[v]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNTS.map((a) => (
                      <SelectItem key={a} value={a}>{ACCOUNT_LABELS[a]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Current Stage</Label>
                <Select value={form.currentStage} onValueChange={(v) => set("currentStage", v as LeadInput["currentStage"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: LeadInput["currentStage"]) => STAGE_LABELS[v]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {PIPELINE_STAGES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => set("priority", v as LeadInput["priority"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: LeadInput["priority"]) => PRIORITY_LABELS[v]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v as LeadInput["status"])}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: LeadInput["status"]) => STATUS_LABELS[v]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1.5">Probability of Closing (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.probabilityOfClosing ?? ""}
                  onChange={(e) => set("probabilityOfClosing", e.target.value === "" ? null : Number(e.target.value))}
                />
              </div>
              <div>
                <Label className="mb-1.5">Meeting Date</Label>
                <Input type="date" value={form.meetingDate ?? ""} onChange={(e) => set("meetingDate", e.target.value)} />
              </div>

              <div>
                <Label className="mb-1.5">Next Follow-up Date</Label>
                <Input type="date" value={form.nextFollowupDate ?? ""} onChange={(e) => set("nextFollowupDate", e.target.value)} />
              </div>
              <div>
                <Label className="mb-1.5">Last Activity Date</Label>
                <Input type="date" value={form.lastActivityDate ?? ""} onChange={(e) => set("lastActivityDate", e.target.value)} />
              </div>

              <div className="col-span-2">
                <Label className="mb-1.5">Notes</Label>
                <Textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Add Lead" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
