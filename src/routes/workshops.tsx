import { createFileRoute, Link } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/workshops")({
  head: () => ({
    meta: [
      { title: "Workshops — Pricing Mastery & More | UGrowth Consultancy" },
      {
        name: "description",
        content:
          "One-off 3-hour live workshops with Captain: Pricing Mastery, First-Client Outreach, Niche Discovery. ₹2,000–₹3,500. Recording included.",
      },
    ],
  }),
  component: WorkshopsPage,
});

type Workshop = {
  id: string;
  badge: string;
  title: string;
  blurb: string;
  duration: string;
  price: string;
  nextDate: string;
  outline: string[];
  outcome: string;
  status: "open" | "waitlist" | "tba";
};

const WORKSHOPS: Workshop[] = [
  {
    id: "pricing-mastery",
    badge: "Captain's most-requested",
    title: "Pricing Mastery — The Anchoring Principle",
    blurb:
      "Why most first-time Indian founders under-charge by 60% — and the 3-tier structure that fixes it permanently.",
    duration: "1 hour live · Zoom · recording included",
    price: "₹2,500",
    nextDate: "Every Thursday · 4:00–5:00 PM IST",
    outline: [
      "Why hourly billing kills Indian solo practices",
      "The Anchoring Principle — why your premium tier matters even if nobody buys it",
      "Building a 3-tier rate card for your specific niche (live worksheet)",
      "How to defend a price increase to existing clients without losing them",
      "Live Q&A with Captain on YOUR rate card",
    ],
    outcome:
      "Leave with a printable 3-tier rate card for your niche, and a 4-line script for raising prices on existing clients.",
    status: "open",
  },
  {
    id: "first-client-outreach",
    badge: "For pre-revenue founders",
    title: "From Zero to First Client — Warm Outreach That Works",
    blurb:
      "The exact LinkedIn + WhatsApp playbook to get your first 3 discovery calls in 14 days. Indian B2B context throughout.",
    duration: "1 hour live · Zoom · recording included",
    price: "₹2,000",
    nextDate: "Every Thursday · 4:00–5:00 PM IST",
    outline: [
      "Mapping your warm circle (the 50 names exercise)",
      "LinkedIn DM templates that don't sound like a robot",
      "The \"3-message\" sequence that gets a meeting (not a sale, a meeting)",
      "Discovery call frame — 5 questions that close 40% of calls",
      "Live role-play: Captain plays the prospect, you pitch",
    ],
    outcome:
      "Leave with a list of 50 warm contacts, 3 DM templates, and a discovery-call script tested live.",
    status: "open",
  },
  {
    id: "niche-discovery",
    badge: "For the stuck",
    title: "Niche Discovery Sprint",
    blurb:
      "Stop being a generic \"marketing person\" or \"freelance designer\". Find the exact intersection of skill × industry × pain that gets you paid.",
    duration: "1 hour live · Zoom · recording included",
    price: "₹2,000",
    nextDate: "Every Thursday · 4:00–5:00 PM IST",
    outline: [
      "Why broad positioning costs you 60% of revenue in year one",
      "The Niche Statement Formula (\"I help X do Y so they can Z\")",
      "Captain's filter: which of your skills are actually marketable in India in 2026",
      "Stress-testing your niche against 3 paying-customer profiles",
      "Live worksheets + 1:1 feedback round",
    ],
    outcome:
      "Leave with a 1-sentence niche statement and 3 named customer profiles to start outreach to on Monday.",
    status: "open",
  },
  {
    id: "gst-udyam-fundamentals",
    badge: "Boring but critical",
    title: "GST, Udyam & Your CA — Fundamentals",
    blurb:
      "When to register, when not to. What your CA usually gets wrong about solo practices. How to keep books your spouse can understand.",
    duration: "1 hour live · Zoom · recording included",
    price: "₹1,500",
    nextDate: "Every Thursday · 4:00–5:00 PM IST",
    outline: [
      "Udyam registration in 9 minutes — when and why",
      "The ₹20L GST threshold for service exports vs domestic — and the trap most solo founders fall into",
      "Section 194J vs 194O — what changes when a platform pays you",
      "Bank account, invoice format, and the 4-fold filing rhythm",
      "Q&A with a panel CA",
    ],
    outcome:
      "Leave knowing exactly which registrations to do this month vs defer, and a simple monthly bookkeeping rhythm.",
    status: "open",
  },
];

const STATUS_LABEL: Record<Workshop["status"], { text: string; cls: string }> = {
  open: { text: "Open · WhatsApp to join", cls: "bg-accent/10 text-accent border-accent/30" },
  waitlist: { text: "Full · Waitlist", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  tba: { text: "Date TBA · Register interest", cls: "bg-muted text-muted-foreground border-border" },
};

function WorkshopsPage() {
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Workshops</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          Captain's live workshops
        </h1>
        <p className="mt-5 text-lg text-foreground max-w-2xl leading-relaxed">
          One topic, one hour, every Thursday 4–5 PM IST — for founders who aren't ready
          for the full 12-week batch. Pay once per topic. Recording yours. No subscription.
        </p>

        <div className="mt-12 grid gap-5">
          {WORKSHOPS.map((w) => {
            const s = STATUS_LABEL[w.status];
            return (
              <div
                key={w.id}
                className="rounded-2xl border border-border bg-card p-6 md:p-8"
              >
                <div className="md:flex md:items-start md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold tracking-wider uppercase text-accent">
                        {w.badge}
                      </span>
                      <span
                        className={`text-[10px] font-semibold tracking-wide uppercase rounded-full border px-2 py-0.5 ${s.cls}`}
                      >
                        {s.text}
                      </span>
                    </div>
                    <h2 className="mt-2 font-display text-xl md:text-2xl text-primary">
                      {w.title}
                    </h2>
                    <p className="mt-2 text-sm text-foreground leading-relaxed">{w.blurb}</p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {w.duration} · <span className="text-foreground">{w.nextDate}</span>
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right">
                    <p className="font-display text-2xl text-primary">{w.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">one-time</p>
                  </div>
                </div>

                <div className="mt-5 grid md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      What's covered
                    </p>
                    <ul className="mt-2 space-y-1.5 text-sm text-foreground list-disc list-inside marker:text-accent">
                      {w.outline.map((o, i) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      What you leave with
                    </p>
                    <p className="mt-2 text-sm text-foreground leading-relaxed">{w.outcome}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <WhatsAppButton
                    context={`workshop_${w.id}_register`}
                    message={`Hi, I want to register interest for the "${w.title}" workshop. Please send me the next date and UPI link.`}
                    label="Register interest via WhatsApp"
                    variant="inline"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Subscribe to workshop drops */}
        <div className="mt-16 rounded-2xl bg-primary text-primary-foreground p-8 md:p-10">
          <h2 className="font-display text-2xl">Want to know first when dates drop?</h2>
          <p className="mt-3 text-primary-foreground/80 leading-relaxed">
            Workshops sell out in 48–72 hours. WhatsApp us with the workshop name and we'll
            add you to the alert list. Or use the AI Advisor between sessions — it's trained
            on the same material Captain teaches live.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <WhatsAppButton
              context="workshops_general_alert"
              message="Hi, please add me to the workshops alert list. Interested in: ___"
              label="Add me to workshops alerts"
              variant="inline"
            />
            <Link
              to="/ai-advisor"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary-foreground/30 px-5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              Try the AI Advisor (free)
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
