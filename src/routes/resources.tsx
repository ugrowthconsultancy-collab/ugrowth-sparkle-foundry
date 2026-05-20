import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Free resources for Indian founders: Brochure A + Brochure B PDFs, free tools, and articles from Captain.",
      },
    ],
  }),
  component: ResourcesPage,
});

const BROCHURE_BASE =
  "https://tpclwsivhsqfsmpueslj.supabase.co/storage/v1/object/public/brochure_pdfs";

const TOOLS = [
  {
    slug: "niche-generator",
    title: "Niche Statement Generator",
    desc: "Captain's formula. 4 fields. One niche line you can put on LinkedIn today.",
  },
  {
    slug: "rate-card-builder",
    title: "Three-Tier Rate Card Builder",
    desc: "Real Indian market rates by city tier + experience. Print-ready.",
  },
  {
    slug: "gst-checker",
    title: "GST Eligibility Checker",
    desc: "5 questions. Find out if you actually need GST today, or can wait.",
  },
  {
    slug: "working-capital",
    title: "Working Capital Calculator",
    desc: "How much money are your clients sitting on right now? Honest math.",
  },
  {
    slug: "vital-signs",
    title: "Founder Vital Signs",
    desc: "10 questions, score 0–100. See exactly where your practice is fragile.",
  },
  {
    slug: "compliance-calendar",
    title: "Compliance Calendar",
    desc: "Personalised 12-month GST + TDS + ROC deadlines for your business type.",
  },
];

function ResourcesPage() {
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Resources</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          Free resources for Indian founders
        </h1>
        <p className="mt-5 text-lg text-foreground max-w-2xl">
          Everything Captain teaches in the batch, freely downloadable. Two brochures, two free
          tools, and articles as they get published.
        </p>

        {/* Brochures */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-primary">Brochures (PDF)</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-3xl">📘</div>
              <h3 className="mt-3 font-display text-xl text-primary">
                Brochure A — Brilliant People, Average Lives
              </h3>
              <p className="mt-2 text-sm text-foreground">
                The why. 42 pages. The 6 archetypes of stuck Indian professionals, the 3 truths,
                the Freedom Trap, the honest readiness test.
              </p>
              <a
                href={`${BROCHURE_BASE}/brilliant-people-average-lives.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Download free PDF →
              </a>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="text-3xl">📗</div>
              <h3 className="mt-3 font-display text-xl text-primary">
                Brochure B — From Job to First Client in 90 Days
              </h3>
              <p className="mt-2 text-sm text-foreground">
                The how. 58 pages. Week-by-week plan, niche statement formula, three-tier rate
                card, GST/Udyam timelines, four-tool stack under ₹2,000/month.
              </p>
              <a
                href={`${BROCHURE_BASE}/from-job-to-first-client-90-days.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Download free PDF →
              </a>
            </div>
          </div>
        </div>

        {/* Free tools */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-primary">Free tools</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {TOOLS.map((t) => (
              <Link
                key={t.slug}
                to="/tools/$slug"
                params={{ slug: t.slug }}
                className="rounded-2xl border border-border bg-card p-6 hover:border-accent transition-colors"
              >
                <h3 className="font-display text-lg text-primary">{t.title}</h3>
                <p className="mt-2 text-sm text-foreground">{t.desc}</p>
                <p className="mt-4 text-xs text-accent">Try it free →</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Captain's open WhatsApp hour */}
        <div className="mt-16 rounded-2xl bg-accent/5 border-2 border-accent p-6 md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            The most under-rated free resource
          </p>
          <h2 className="mt-2 font-display text-2xl text-primary">
            Captain's open WhatsApp hour — every Friday, 7–8 PM IST
          </h2>
          <p className="mt-3 text-sm text-foreground leading-relaxed max-w-2xl">
            One hour a week, Captain answers questions personally — niche, pricing, exits,
            family conversations, refunds, GST, the awkward stuff. No batch fee. No
            application. WhatsApp us the question by Friday 4 PM.
          </p>
          <div className="mt-5">
            <a
              href={`https://wa.me/919650297779?text=${encodeURIComponent("Hi Captain, I want to join the next Friday open WhatsApp hour. My question is: ")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Send my question →
            </a>
          </div>
        </div>

        {/* Articles */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-primary">Articles & deep-dives</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Written by Captain and the alumni network. Publishing weekly from August 2026.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-base text-foreground">
              Until the first article drops, the AI Advisor answers any question on Captain's
              methodology directly — in English, Hindi, or Hinglish.
            </p>
            <Link
              to="/ai-advisor"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Ask the AI Advisor →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
