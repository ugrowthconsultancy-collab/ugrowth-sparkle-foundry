import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.min(100, Math.max(0, (step / total) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Step {step} of {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-accent transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function WizardShell({
  title,
  step,
  total,
  canContinue,
  onBack,
  onContinue,
  continueLabel,
  children,
}: {
  title: string;
  step: number;
  total: number;
  canContinue: boolean;
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-4 py-6 md:py-10">
      <ProgressBar step={step} total={total} />
      <div className="mt-6 flex-1">
        <h2 className="font-display text-2xl font-semibold text-primary md:text-3xl">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-8 flex items-center justify-between gap-3 pt-4">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={!onBack}
          className="min-h-11"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <Button onClick={onContinue} disabled={!canContinue} className="min-h-11">
          {continueLabel ?? "Continue"} <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
