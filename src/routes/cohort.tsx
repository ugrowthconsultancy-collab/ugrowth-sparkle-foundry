import { createFileRoute, Link } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/cohort")({
  head: () => ({
    meta: [
      { title: "The 12-Week Batch — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "From job to first paying client in 90 days. A 12-week batch built and led by Captain Ankur Kulshrestha (Retd, Indian Navy). Cohort certificate in Professional, Business and Management Consultancy from MEPSC (Management & Entrepreneurship and Professional Skills Council).",
      },
    ],
  }),
  component: CohortPage,
});

function CohortPage() {
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">The Batch</p>
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
            From Job to First Client in 90 Days
          </h1>
          <p className="mt-5 text-lg text-foreground max-w-2xl mx-auto leading-relaxed">
            A 12-week batch built and led by Captain Ankur Kulshrestha (Retd, Indian Navy).
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-card border border-border px-3 py-1.5">
              20–25 founders per batch
            </span>
            <span className="rounded-full bg-card border border-border px-3 py-1.5">
              Captain on every session
            </span>
            <span className="rounded-full bg-card border border-border px-3 py-1.5">
              Certificate in Professional, Business &amp; Management Consultancy (MEPSC)
            </span>
          </div>
        </div>

        {/* What you get */}
        <div className="mt-16 grid gap-5 md:grid-cols-4">
          {[
            {
              title: "Methodology",
              body: "Captain's complete 90-day playbook applied to your specific niche.",
            },
            {
              title: "Live training",
              body: "11 live sessions over 12 weeks — Tuesday and Thursday evenings IST.",
            },
            {
              title: "Capstone with Captain",
              body: "Defend your business plan in a 20-minute viva. Harder than your first client meeting.",
            },
            {
              title: "MEPSC certificate",
              body: "Certificate in Professional, Business and Management Consultancy, issued under the Management & Entrepreneurship and Professional Skills Council (MEPSC) framework.",
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-display text-lg text-primary">{c.title}</h3>
              <p className="mt-2 text-sm text-foreground">{c.body}</p>
            </div>
          ))}
        </div>

        {/* Curriculum */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl text-primary">12-week curriculum</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                Phase 1 · Foundation (Weeks 1–4)
              </p>
              <ul className="mt-3 space-y-2 text-[15px] text-foreground list-disc list-inside marker:text-accent">
                <li>Self-audit + niche discovery</li>
                <li>Demand test (LinkedIn polls, WhatsApp surveys, 5 discovery calls)</li>
                <li>Legal structure + CA conversation (Sole Prop / LLP / Pvt Ltd, Udyam, GST timing)</li>
                <li>Four-tool stack under ₹2,000/month</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                Phase 2 · Presence (Weeks 5–8)
              </p>
              <ul className="mt-3 space-y-2 text-[15px] text-foreground list-disc list-inside marker:text-accent">
                <li>3-paragraph origin story</li>
                <li>LinkedIn + Instagram + website alignment</li>
                <li>Pricing psychology + Anchoring Principle</li>
                <li>Three-Tier Rate Card with anchor</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                Phase 3 · Practice (Weeks 9–12)
              </p>
              <ul className="mt-3 space-y-2 text-[15px] text-foreground list-disc list-inside marker:text-accent">
                <li>20 warm outreach conversations</li>
                <li>5 discovery calls → first proposal + GST invoice</li>
                <li>Deliver with 3 memorable moments</li>
                <li>Feedback, referral, case study</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                Capstone (Week 13)
              </p>
              <ul className="mt-3 space-y-2 text-[15px] text-foreground list-disc list-inside marker:text-accent">
                <li>20-minute business-plan viva with Captain</li>
                <li>Live Q&amp;A defence</li>
                <li>Certificate in Professional, Business and Management Consultancy (MEPSC) issued</li>
                <li>Lifetime alumni WhatsApp + monthly Captain Q&amp;A access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Next batch + price */}
        <div className="mt-12 rounded-2xl border-2 border-accent bg-card p-6 md:p-10">
          <div className="md:flex md:items-center md:justify-between gap-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Next batch
              </p>
              <h2 className="mt-2 font-display text-3xl md:text-4xl text-primary">
                TBA — join the waitlist
              </h2>
              <p className="mt-3 text-foreground">
                ₹30,000 for Batch 1 (launch pricing) · ₹35,000 from Batch 2 onwards
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                100% refund if you don't have a signed proposal or a documented verbal commitment from a paying client by Day 90. ("Paying client" = an Indian individual or business who has explicitly said yes in writing or on a recorded call, with a proposed payment amount and timeline.)
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col gap-2 md:items-end">
              <Link
                to="/apply"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 text-base font-medium text-accent-foreground hover:bg-accent/90"
              >
                Apply for the next batch →
              </Link>
              <WhatsAppButton
                context="cohort_talk_to_graduate"
                message="Hi, I'd like to talk to a UGrowth batch graduate before I apply."
                label="Talk to a graduate first"
                variant="ghost"
              />
            </div>
          </div>
        </div>

        {/* Two tracks */}
        <div className="mt-12">
          <h2 className="font-display text-2xl md:text-3xl text-primary">Two tracks, one batch</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                Standard track
              </p>
              <h3 className="mt-2 font-display text-xl text-primary">
                Captain-led · all archetypes welcome
              </h3>
              <p className="mt-3 text-sm text-foreground">
                Default batch. Fits any of the 6 archetypes: Stuck Professional, Side Hustler,
                Return-to-Work, Rising Graduate, First-Gen Consultant, Tier-2 Dreamer.
              </p>
              <p className="mt-4 text-sm font-medium text-primary">₹30,000</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                Return-to-Work track
              </p>
              <h3 className="mt-2 font-display text-xl text-primary">
                Bhavna Srivastava–led · women returning from a career break
              </h3>
              <p className="mt-3 text-sm text-foreground">
                Designed for women who took 3, 5, or 12 years off. Adjusted pace, sister batch
                WhatsApp group, dignified flexible pricing.
              </p>
              <p className="mt-4 text-sm font-medium text-primary">₹20,000 (subsidised)</p>
            </div>
          </div>
        </div>

        {/* Not for you if... */}
        <div className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-6 md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-destructive">
            This batch is NOT for you if
          </p>
          <h2 className="mt-2 font-display text-2xl text-primary">
            Be honest with yourself. Save your ₹30,000.
          </h2>
          <ul className="mt-5 space-y-2.5 text-[15px] text-foreground list-disc list-inside marker:text-destructive">
            <li>You want a passive income MRR machine. This is consulting, not SaaS.</li>
            <li>You expect us to find clients for you. We teach you to find them — that is the whole point.</li>
            <li>You can't commit 5–7 hours a week for 12 weeks. The capstone defence is real.</li>
            <li>You want a quick certificate for LinkedIn without doing the work.</li>
            <li>You're chasing a quick-money niche (crypto, dropshipping, "AI agencies"). We won't help.</li>
            <li>You haven't read either brochure yet. Read them first — they teach 80% of what we cover.</li>
            <li>Your family is not onboard. We mean it. Have that conversation first.</li>
          </ul>
          <p className="mt-5 text-sm text-foreground">
            If any of these are you, we will refund you within 14 days of joining, no questions
            asked. Captain would rather you spend the money on something that actually helps.
          </p>
        </div>

        {/* What past founders had on Day 90 */}
        <div className="mt-12 rounded-2xl bg-primary text-primary-foreground p-6 md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            What Day 90 actually looks like
          </p>
          <h2 className="mt-2 font-display text-2xl">
            Honest numbers from the previous mentorship batches
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-5">
            <div>
              <p className="font-display text-3xl text-accent">~70%</p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                had a signed paying client by Day 90
              </p>
            </div>
            <div>
              <p className="font-display text-3xl text-accent">~20%</p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                were in late-stage discovery, not yet signed
              </p>
            </div>
            <div>
              <p className="font-display text-3xl text-accent">~10%</p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                got refunds — and that is the point of the guarantee
              </p>
            </div>
            <div>
              <p className="font-display text-3xl text-accent">₹35k–₹2.2L</p>
              <p className="mt-1 text-sm text-primary-foreground/80">
                first-client invoice size, by archetype
              </p>
            </div>
          </div>
          <p className="mt-5 text-xs text-primary-foreground/70">
            Numbers are directional, based on Captain's 1,000+ mentee history pre-batch.
            Batch 1 results will be published with named alumni consent.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-display text-2xl md:text-3xl text-primary">FAQ</h2>
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="font-medium text-primary">Who is this for?</h3>
              <p className="mt-1 text-sm text-foreground">
                Indian professionals serious about leaving a salaried job (or formalising a side
                hustle) within 6–12 months. Not for tourists — capstone defence is real.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">How is this different from other courses?</h3>
              <p className="mt-1 text-sm text-foreground">
                Small batch (20–25 max). Captain personally on every session and on capstone.
                India-specific (GST, Udyam, MSMED Act, B2B payment cycles), not US-funnel
                cargo-cult. Certificate issued in Professional, Business and Management
                Consultancy under the MEPSC framework.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">What's the time commitment?</h3>
              <p className="mt-1 text-sm text-foreground">
                ~5–7 hours/week. Two 90-minute live sessions, plus weekly application work.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">What happens if I don't finish?</h3>
              <p className="mt-1 text-sm text-foreground">
                You can defer once to the next batch, no charge. Beyond that, no refund — but the
                refund policy above (no signed proposal or verbal commitment by Day 90) still applies.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">What is the MEPSC certificate?</h3>
              <p className="mt-1 text-sm text-foreground">
                The Management &amp; Entrepreneurship and Professional Skills Council (MEPSC)
                is one of India's Sector Skill Councils set up under the National Skill
                Development Corporation. On capstone, you receive a Certificate in{" "}
                <strong>Professional, Business and Management Consultancy</strong>, issued
                under the MEPSC framework. The certificate carries Captain's countersignature
                and is recognised by Indian employers and professional networks as a skill
                credential — useful to cite in proposals and on LinkedIn.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">Can I get an EMI?</h3>
              <p className="mt-1 text-sm text-foreground">
                Yes — UPI-based 3-month split (₹10,200/month) or 6-month split via Razorpay (small
                issuer charge). Ask us on WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/apply"
            className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-8 text-base font-medium text-accent-foreground hover:bg-accent/90"
          >
            Apply for the next batch →
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            Captain personally reviews every application within 5 working days.
          </p>
        </div>
      </div>
    </section>
  );
}
