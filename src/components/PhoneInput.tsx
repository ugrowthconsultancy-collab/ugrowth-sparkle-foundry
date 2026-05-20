import * as React from "react";
import { cn } from "@/lib/utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "prefix"> {
  error?: boolean;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, error, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
      e.target.value = digits;
      onChange?.(e);
    };
    return (
      <div
        className={cn(
          "flex items-stretch rounded-md border border-input bg-background overflow-hidden focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-background",
          error && "border-destructive",
          className,
        )}
      >
        <span className="inline-flex items-center px-3 bg-muted text-muted-foreground text-sm font-medium border-r border-input select-none">
          +91
        </span>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          maxLength={10}
          onChange={handleChange}
          className="flex-1 min-h-11 px-3 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          {...props}
        />
      </div>
    );
  },
);
PhoneInput.displayName = "PhoneInput";
