import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().trim().email().max(255);

export function EmailGate({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  submitLabel?: string;
  onSubmit: (email: string) => Promise<void> | void;
}) {
  const [email, setEmail] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function handle() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErr("Please enter a valid email.");
      return;
    }
    if (!agree) {
      setErr("Please accept the privacy notice.");
      return;
    }
    setErr(null);
    setBusy(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
            <Mail className="h-6 w-6 text-accent" />
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="email-gate-input">Email address</Label>
            <Input
              id="email-gate-input"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1"
            />
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={agree}
              onCheckedChange={(v) => setAgree(v === true)}
              className="mt-0.5"
            />
            <span>
              I agree that UGrowth Consultancy can email me this result and
              occasional useful tips. I can unsubscribe any time (DPDP).
            </span>
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={handle} disabled={busy}>
            {busy ? "Saving…" : submitLabel ?? "Send & save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
