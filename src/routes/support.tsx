import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { UpiQRCode } from "@/components/UpiQRCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPublicSetting } from "@/lib/app-settings";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { track } from "@/lib/track";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support UGrowth — UPI donation | UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Mentoring, brochures, AI Advisor and the free tools cost us money to run. If they helped you, a UPI donation of any size keeps them free for the next founder.",
      },
    ],
  }),
  component: SupportPage,
});

const SUGGESTED = [250, 500, 1000, 2500];

function SupportPage() {
  const [vpa, setVpa] = React.useState("");
  const [payee, setPayee] = React.useState("");
  const [amount, setAmount] = React.useState<number | null>(500);
  const [customAmount, setCustomAmount] = React.useState("");

  React.useEffect(() => {
    track("support_page_view");
    (async () => {
      const [a, b] = await Promise.all([
        getPublicSetting("upi_id"),
        getPublicSetting("upi_payee_name"),
      ]);
      setVpa(a);
      setPayee(b);
    })();
  }, []);

  const finalAmount = amount ?? (customAmount ? parseInt(customAmount.replace(/[^0-9]/g, ""), 10) : undefined) ?? undefined;

  return (
    <section className="flex-1 px-4 py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Support us</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          The free stuff actually costs us money.
        </h1>
        <p className="mt-5 text-base md:text-lg text-foreground leading-relaxed">
          The AI Advisor, both brochures, the 6 free tools, Captain's Friday open WhatsApp hour
          — none of it is paid for by ads, and we don't sell your data. If any of it helped
          you, a UPI donation of any size keeps it free for the next Indian founder who walks
          in. Equally — feel free to take everything for free and pay nothing. That's the
          arrangement.
        </p>

        <div className="mt-10 grid md:grid-cols-[1fr_280px] gap-8 items-start">
          {/* Left — amount + context */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
              Pick an amount
            </p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setAmount(s);
                    setCustomAmount("");
                    track("support_amount_pick", { amount: s });
                  }}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition-colors ${
                    amount === s
                      ? "border-accent bg-accent/10 text-primary"
                      : "border-border bg-card text-foreground hover:border-accent/50"
                  }`}
                >
                  ₹{s.toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <Label htmlFor="custom" className="text-xs">
                Or enter your own amount (₹)
              </Label>
              <Input
                id="custom"
                inputMode="numeric"
                placeholder="e.g., 750"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(null);
                }}
                className="mt-1.5 max-w-[200px]"
              />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                What ₹500 actually pays for
              </p>
              <ul className="mt-3 space-y-1.5 text-sm text-foreground list-disc list-inside marker:text-accent">
                <li>~1 day of AI Advisor compute for 5 founders</li>
                <li>1 hour of Captain's open WhatsApp time, indirectly</li>
                <li>Or — Captain's chai bill at the next Mumbai meetup. Equally valid.</li>
              </ul>
            </div>

            <div className="mt-8 text-sm text-muted-foreground">
              <p>
                Donations are personal payments to Surendra Kulshrestha and are{" "}
                <strong>not tax-deductible</strong>. We are not registered under 12A / 80G.
                If you need a GST invoice for a "business expense" you'd rather not call a
                donation, write to us on WhatsApp and we'll convert it to a paid mentoring
                slot or workshop seat at the same amount.
              </p>
            </div>
          </div>

          {/* Right — QR */}
          <div className="rounded-2xl border-2 border-accent bg-card p-5">
            {vpa && payee ? (
              <UpiQRCode
                vpa={vpa}
                payeeName={payee}
                amount={finalAmount}
                note="UGrowth support"
                reference={`SUP-${Date.now().toString().slice(-6)}`}
              />
            ) : (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
                Loading QR…
              </div>
            )}
          </div>
        </div>

        {/* After-pay actions */}
        <div className="mt-12 rounded-2xl bg-primary text-primary-foreground p-6 md:p-8">
          <h2 className="font-display text-xl">After you've paid (or instead of paying)</h2>
          <p className="mt-3 text-sm text-primary-foreground/80 leading-relaxed">
            The single best thing you can do for UGrowth is to send the brochures or the AI
            Advisor link to one Indian friend who'd benefit. Word-of-mouth is the only growth
            channel we trust.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <WhatsAppButton
              context="support_share"
              message={`Just found UGrowth Consultancy — free playbook (100 pages), free AI advisor in Hindi/English, real methodology from Captain Ankur Kulshrestha (Retd Indian Navy). Worth a look if you're thinking of starting your own practice: https://ugrowth-sparkle-foundry.lovable.app/`}
              label="Share with one friend via WhatsApp"
              variant="inline"
            />
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary-foreground/30 px-5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              Back to UGrowth
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
