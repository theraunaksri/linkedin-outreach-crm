"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Unlock, Loader2 } from "lucide-react";
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
import { unlockEditing, lockEditing } from "@/lib/actions/auth";

export function UnlockEditing({ editUnlocked }: { editUnlocked: boolean }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await unlockEditing(password);
      if (res.ok) {
        toast.success("Editing unlocked");
        setOpen(false);
        setPassword("");
        router.refresh();
      } else {
        toast.error("Incorrect password");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onLock() {
    await lockEditing();
    toast.success("Editing locked");
    router.refresh();
  }

  if (editUnlocked) {
    return (
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={onLock}>
        <Unlock className="h-3.5 w-3.5" /> Editing unlocked
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setOpen(true)}>
        <Lock className="h-3.5 w-3.5" /> Unlock editing
      </Button>
      <DialogContent className="sm:max-w-xs">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Unlock Editing</DialogTitle>
            <DialogDescription>Enter the edit password to add, change, or delete anything.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="edit-password" className="mb-1.5">Password</Label>
            <Input
              id="edit-password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Unlock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
