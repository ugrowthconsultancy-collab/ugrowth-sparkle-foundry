import * as React from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";

export type DetailField = {
  label: string;
  value: React.ReactNode;
};

export function DetailDrawer({
  open,
  onOpenChange,
  title,
  description,
  fields,
  footer,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  fields: DetailField[];
  footer?: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display text-xl text-primary">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {fields.map((f, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {f.label}
              </p>
              <div className="text-sm text-foreground break-words">
                {f.value === null || f.value === undefined || f.value === "" ? (
                  <span className="text-muted-foreground">—</span>
                ) : (
                  f.value
                )}
              </div>
            </div>
          ))}
        </div>
        {footer && <div className="mt-8 pt-6 border-t border-border space-y-2">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

export function JsonBlock({ value }: { value: unknown }) {
  return (
    <pre className="text-xs bg-muted rounded-md p-3 overflow-x-auto font-mono">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}
