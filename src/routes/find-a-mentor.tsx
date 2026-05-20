import { createFileRoute, Link } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/find-a-mentor")({
  head: () => ({
    meta: [
      { title: "Find a Mentor — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Mentor marketplace launches Q3 2026. Until then, talk to our AI Advisor (trained on Captain's methodology) or join the 12-week batch for direct Captain access.",
      },
    ],
  }),
  component: FindMentorPage,
});

function FindMentorPage() {
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Mentorship</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          Find a mentor
        </h1>
        <p className="mt-5 text-lg text-foreground max-w-2xl leading-relaxed">
          Our curated Indian mentor marketplace launches in Q3 2026. Until then, two ways we
          help right now — both free or paid-once, no monthly subscription.
        </p>

        {/* Two paths */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="text-3xl">🤖</div>
            <h2 className="mt-4 font-display text-xl text-primary">Talk to our AI Advisor</h2>
            <p className="mt-3 text-sm text-foreground leading-relaxed">
              Trained on Captain Ankur Kulshrestha's complete methodology — Brochure A (the 6
              archetypes, 3 truths, Freedom Trap) and Brochure B (the 90-day playbook, niche
              formula, three-tier rate card).
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-foreground list-disc list-inside marker:text-accent">
              <li>Plain Indian English / Hindi / Hinglish</li>
              <li>5 free questions without signup · 30 messages a day after free signup</li>
              <li>Indian context throughout (GST, Udyam, MSMED, tier-2 cities)</li>
              <li>No signup needed for the first 5 messages</li>
            </ul>
            <Link
              to="/ai-advisor"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Try the AI Advisor →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="text-3xl">🎓</div>
            <h2 className="mt-4 font-display text-xl text-primary">
              Join the 12-week batch
            </h2>
            <p className="mt-3 text-sm text-foreground leading-relaxed">
              Get Captain personally for 12 weeks. Two live sessions per week. Capstone
              defence. Certificate in Professional, Business and Management Consultancy under
              the MEPSC (Management &amp; Entrepreneurship and Professional Skills Council)
              framework. Limited to 20–25 founders per batch.
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-foreground list-disc list-inside marker:text-accent">
              <li>Captain on every session</li>
              <li>Lifetime alumni WhatsApp + monthly Q&amp;A</li>
              <li>₹30,000 (₹35,000 from Cohort 2)</li>
              <li>100% refund if no clear path to paying client by Day 90</li>
            </ul>
            <Link
              to="/cohort"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              See the batch details →
            </Link>
          </div>
        </div>

        {/* Waitlist for marketplace */}
        <div className="mt-16 rounded-2xl bg-primary text-primary-foreground p-8 md:p-10">
          <h2 className="font-display text-2xl text-primary-foreground">
            Want to be on the mentor marketplace waitlist?
          </h2>
          <p className="mt-3 text-primary-foreground/80 leading-relaxed">
            We're hand-picking the first 30 Indian mentors — verified Captain alumni, working
            practitioners, no charlatans. When the marketplace opens in Q3 2026, waitlist users
            get first access plus 50% off their first month.
          </p>
          <p className="mt-3 text-sm text-primary-foreground/70">
            For now, message us on WhatsApp with your interest — we'll add you and email when
            it's live.
          </p>
          <div className="mt-6">
            <WhatsAppButton
              context="mentor_marketplace_waitlist"
              message="Hi, please add me to the mentor marketplace waitlist for Q3 2026 launch."
              label="Join the waitlist via WhatsApp"
              variant="inline"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
