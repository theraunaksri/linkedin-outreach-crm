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
  { key: "callsScheduled", label: "Discovery Calls Scheduled" },
  { key: "callsCompleted", label: "Discovery Calls Completed" },
  { key: "prototypeShared", label: "Prototype Shared" },
  { key: "proposalSent", label: "Proposal Sent" },
  { key: "negotiation", label: "Negotiation" },
  { key: "contractSent", label: "Contract Sent" },
  { key: "contractSigned", label: "Contract Signed" },
  { key: "wonDeals", label: "Deal Won" },
  { key: "lostDeals", label: "Deal Lost" },
];

type TotalsMap = Record<LinkedInAccount, OutreachTotalsInput>;

export function EditMetricsDialog({
  defaultAccount,
  initialTotals,
}: {
  defaultAccount: LinkedInAccount;
  initialTotals: TotalsMap;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [account, setAccount] = React.useState<LinkedInAccount>(defaultAccount);
  const [values, setValues] = React.useState<TotalsMap>(initialTotals);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setAccount(defaultAccount);
      setValues(initialTotals);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultAccount]);

  function setField(key: keyof OutreachTotalsInput, raw: string) {
    const n = raw === "" ? 0 : Math.max(0, Number(raw));
    setValues((prev) => ({ ...prev, [account]: { ...prev[account], [key]: n } }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await upsertOutreachTotals(account, values[account]);
      toast.success(`${ACCOUNT_LABELS[account]} numbers updated`);
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to update numbers");
    } finally {
      setSubmitting(false);
    }
  }

  const current = values[account];

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
              record for every person you messaged.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-3">
            <Label className="mb-1.5">LinkedIn Account</Label>
            <Select value={account} onValueChange={(v) => setAccount(v as LinkedInAccount)}>
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

          <ScrollArea className="flex-1 min-h-0 px-6">
            <div className="grid grid-cols-2 gap-4 pb-4">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <Label className="mb-1.5">{f.label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={current[f.key]}
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
