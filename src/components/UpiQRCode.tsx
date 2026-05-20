import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { buildUpiUri } from "@/lib/app-settings";
import { cn } from "@/lib/utils";

export function UpiQRCode({
  vpa,
  payeeName,
  amount,
  note,
  reference,
  size = 220,
  className,
}: {
  vpa: string;
  payeeName: string;
  amount?: number; // rupees
  note?: string;
  reference?: string;
  size?: number;
  className?: string;
}) {
  const uri = buildUpiUri({ pa: vpa, pn: payeeName, am: amount, tn: note, tr: reference });
  const [copied, setCopied] = React.useState(false);

  async function copyVpa() {
    try {
      await navigator.clipboard.writeText(vpa);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="rounded-lg bg-white p-3 border border-border">
        <QRCodeSVG value={uri} size={size} level="M" includeMargin={false} />
      </div>
      <div className="text-center">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">UPI VPA</div>
        <button
          type="button"
          onClick={copyVpa}
          className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-sm text-foreground hover:text-accent"
          aria-label="Copy UPI VPA"
        >
          {vpa}
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <a
        href={uri}
        className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-accent text-accent-foreground font-medium hover:bg-accent/90"
      >
        Open in UPI app
      </a>
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Scan with Google Pay, PhonePe, Paytm or any UPI app. After paying, tap
        "I've paid" below — our team will verify within a few hours.
      </p>
    </div>
  );
}
