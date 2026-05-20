import { createFileRoute, Link } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/upgrade-pro")({
  head: () => ({
    meta: [
      { title: "AI Pro — Unlimited AI Advisor | UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Upgrade to AI Pro for unlimited messages with the UGrowth AI Advisor, longer memory, and Hindi voice replies. ₹199/month, cancel any time.",
      },
    ],
  }),
  component: UpgradePage,
});

const FREE = [
  "30 messages a day",
  "Captain's full methodology (Brochures A + B)",
  "English / Hindi / Hinglish",
  "Standard response model (Gemini 1.5 Flash)",
  "Conversation memory: current chat only",
];

const PRO = [
  "Unlimited messages",
  "Captain's full methodology (Brochures A + B)",
  "English / Hindi / Hinglish",
  "Pro response model (longer, more nuanced answers)",
  "Conversation memory across all chats",
  "Priority queue when traffic is high",
  "Export your chat history to PDF",
  "Early access to new tools (Niche, Rate Card v2, Proposal Builder)",
];

function UpgradePage() {
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">AI Pro</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          Unlimited AI Advisor — ₹199/month
        </h1>
        <p className="mt-5 text-lg text-foreground max-w-2xl leading-relaxed">
          You're using the AI more than 30 times a day. That's a good sign. AI Pro removes the
          cap, gives you a smarter model, and remembers your business across conversations.
        </p>

        {/* Compare */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Free card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              Free
            </p>
            <h2 className="mt-2 font-display text-2xl text-primary">Always free</h2>
            <p className="mt-3 text-foreground">₹0 forever</p>
            <ul className="mt-6 space-y-2.5 text-sm text-foreground">
              {FREE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/ai-advisor"
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5 w-full"
            >
              Use the free AI Advisor
            </Link>
          </div>

          {/* Pro card */}
          <div className="rounded-2xl border-2 border-accent bg-card p-6 md:p-8 relative">
            <span className="absolute -top-3 right-6 bg-accent text-accent-foreground text-[11px] font-semibold px-3 py-1 rounded-full">
              Most popular
            </span>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              AI Pro
            </p>
            <h2 className="mt-2 font-display text-2xl text-primary">Pro</h2>
            <p className="mt-3">
              <span className="text-foreground text-lg">₹199</span>
              <span className="text-sm text-muted-foreground"> / month</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Or ₹1,799 / year (save ₹589)
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-foreground">
              {PRO.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">✓</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <WhatsAppButton
              context="upgrade_pro_monthly"
              message="Hi, I want to upgrade to AI Pro (₹199/month). Please send me a UPI link."
              label="Upgrade via WhatsApp + UPI →"
              variant="inline"
              className="mt-8 w-full justify-center"
            />
            <p className="mt-3 text-xs text-muted-foreground text-center">
              Cancel any time. Refund pro-rated within 7 days.
            </p>
          </div>
        </div>

        {/* What you actually get */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-primary">What changes on Day 1</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Unlimited",
                body: "No 30-message ceiling. Stay in flow when you're working through a proposal or a discovery script.",
              },
              {
                title: "Pro model",
                body: "Longer responses, fewer hallucinations on numbers, better Hindi/Hinglish fluency.",
              },
              {
                title: "Memory across chats",
                body: "The AI remembers your niche, your archetype, your rate card. Stop re-explaining your business every session.",
              },
            ].map((b) => (
              <div key={b.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-display text-lg text-primary">{b.title}</h3>
                <p className="mt-2 text-sm text-foreground leading-relaxed">{b.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-primary">FAQ</h2>
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="font-medium text-primary">Why not Razorpay / Stripe?</h3>
              <p className="mt-1 text-sm text-foreground">
                We're WhatsApp-centric. UPI is faster, has zero fees, and works for 99% of
                Indian founders. We'll add Razorpay if enough users ask.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">Can I get an invoice?</h3>
              <p className="mt-1 text-sm text-foreground">
                Yes — GST-compliant invoice in your name (or company name) emailed within 24
                hours of payment. Include your details in the WhatsApp message.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">Is the batch included in Pro?</h3>
              <p className="mt-1 text-sm text-foreground">
                No. Pro covers the AI Advisor only. The 12-week batch is a separate one-time
                payment (₹30,000) and includes live Captain access. See{" "}
                <Link to="/cohort" className="underline text-primary">
                  the batch page
                </Link>
                .
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">What does "cancel any time" actually mean?</h3>
              <p className="mt-1 text-sm text-foreground">
                You pay month-to-month via UPI. Don't pay next month, you go back to free. No
                contracts, no card on file, no cancellation form to fight with.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Not sure yet? Use the free AI Advisor and decide if you need Pro after a week.
          </p>
          <Link
            to="/ai-advisor"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Try the free AI Advisor first →
          </Link>
        </div>
      </div>
    </section>
  );
}
