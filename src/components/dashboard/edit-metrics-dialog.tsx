"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { upsertOutreachTotals, type OutreachTotalsInput } from "@/lib/actions/metrics";
import { ACCOUNT_LABELS, ACCOUNTS } from "@/lib/constants";
import type { LinkedInAccount } from "@/generated/prisma/enums";

const FIELDS: { key: keyof OutreachTotalsInput; label: string }[] = [
  { key: "requestsSent", label: "Connection Requests Sent" },
  { key: "connectionsAccepted", label: "Total Leads (Connected)" },
  { key: "conversationStarted", label: "Conversation Started" },
  { key: "engaged", label: "Engaged" },
  { key: "interested", label: "Interested" },
  { key: "firstMessagesSent", label: "First Messages Sent" },
  { key: "firstFollowupsSent", label: "First Follow-ups Sent" },
  { key: "secondFollowupsSent", label: "Second Follow-ups Sent" },
  { key: "thirdFollowupsSent", label: "Third Follow-ups Sent" },
  { key: "repliesReceived", label: "Replies Received" },
  { key: "positiveReplies", label: "Positive Replies" },
  { key: "negativeReplies", label: "Negative Replies" },
  { key: "prototypeShared", label: "Prototype Shared" },
  { key: "proposalSent", label: "Proposal Sent" },
  { key: "negotiation", label: "Negotiation" },
  { key: "contractSent", label: "Contract Sent" },
  { key: "contractSigned", label: "Contract Signed" },
  { key: "wonDeals", label: "Deal Won" },
  { key: "lostDeals", label: "Deal Lost" },
];

const EMPTY: OutreachTotalsInput = {
  requestsSent: 0,
  connectionsAccepted: 0,
  conversationStarted: 0,
  engaged: 0,
  interested: 0,
  firstMessagesSent: 0,
  firstFollowupsSent: 0,
  secondFollowupsSent: 0,
  thirdFollowupsSent: 0,
  repliesReceived: 0,
  positiveReplies: 0,
  negativeReplies: 0,
  callsScheduled: 0,
  callsCompleted: 0,
  prototypeShared: 0,
  proposalSent: 0,
  negotiation: 0,
  contractSent: 0,
  contractSigned: 0,
  wonDeals: 0,
  lostDeals: 0,
};

const ALL_TIME_LABEL = "All-Time Totals";

type TotalsByPeriod = Record<LinkedInAccount, Record<string, OutreachTotalsInput>>;

export function EditMetricsDialog({
  defaultAccount,
  totalsByPeriod,
  months,
}: {
  defaultAccount: LinkedInAccount;
  totalsByPeriod: TotalsByPeriod;
  months: { value: string; label: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [account, setAccount] = React.useState<LinkedInAccount>(defaultAccount);
  const [periodLabel, setPeriodLabel] = React.useState<string>(ALL_TIME_LABEL);
  const [values, setValues] = React.useState<OutreachTotalsInput>(totalsByPeriod[defaultAccount]?.[ALL_TIME_LABEL] ?? EMPTY);
  const [submitting, setSubmitting] = React.useState(false);

  const periodOptions = [{ value: ALL_TIME_LABEL, label: "All-Time Totals" }, ...months];

  React.useEffect(() => {
    if (open) {
      setAccount(defaultAccount);
      setPeriodLabel(ALL_TIME_LABEL);
      setValues(totalsByPeriod[defaultAccount]?.[ALL_TIME_LABEL] ?? EMPTY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultAccount]);

  function selectAccount(a: LinkedInAccount) {
    setAccount(a);
    setValues(totalsByPeriod[a]?.[periodLabel] ?? EMPTY);
  }

  function selectPeriod(p: string | null) {
    if (!p) return;
    setPeriodLabel(p);
    setValues(totalsByPeriod[account]?.[p] ?? EMPTY);
  }

  function setField(key: keyof OutreachTotalsInput, raw: string) {
    const n = raw === "" ? 0 : Math.max(0, Number(raw));
    setValues((prev) => ({ ...prev, [key]: n }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await upsertOutreachTotals(account, values, periodLabel);
      toast.success(`${ACCOUNT_LABELS[account]} numbers updated for ${periodOptions.find((p) => p.value === periodLabel)?.label}`);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update numbers");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" /> Edit Outreach Numbers
      </Button>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <form onSubmit={onSubmit} className="flex flex-col max-h-[85vh]">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Edit Outreach Numbers</DialogTitle>
            <DialogDescription>
              Update your bulk outreach counts directly — these feed the KPI cards without needing a full lead
              record for every person you messaged. Pick a month to log that month's numbers specifically, or
              All-Time Totals for the running grand total.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-3 grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5">LinkedIn Account</Label>
              <Select value={account} onValueChange={(v) => selectAccount(v as LinkedInAccount)}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: LinkedInAccount) => ACCOUNT_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNTS.map((a) => (
                    <SelectItem key={a} value={a}>{ACCOUNT_LABELS[a]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5">Period</Label>
              <Select value={periodLabel} onValueChange={selectPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => periodOptions.find((p) => p.value === v)?.label ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {periodOptions.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1 min-h-0 px-6">
            <div className="grid grid-cols-2 gap-4 pb-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <Label className="mb-1.5">{f.label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={values[f.key] ?? 0}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="px-6 py-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Numbers
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
