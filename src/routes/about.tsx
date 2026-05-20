import { createFileRoute, Link } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Why UGrowth Consultancy exists, who built it, and the methodology behind it. Captain Ankur Kulshrestha (Retd) + Bhavna Srivastava + Ruchii.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">About</p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          Why UGrowth Consultancy
        </h1>
        <p className="mt-6 text-lg text-foreground leading-relaxed">
          Free help to start your own practice in India. Real methodology, real tools, real
          mentors. No catch. Built and led by{" "}
          <span className="font-medium">Captain Ankur Kulshrestha (Retd, Indian Navy)</span>{" "}
          — Captain's full credentials, including his University of Mumbai Board of Studies
          membership and MEPSC affiliate status, are listed below in his bio.
        </p>

        <h2 className="mt-12 font-display text-2xl md:text-3xl text-primary">Our promise</h2>
        <p className="mt-4 text-base text-foreground leading-relaxed">
          We help brilliant Indian professionals stuck in average lives — engineers in Bangalore,
          marketing managers in Mumbai, CAs in Jaipur, homemakers in Kochi, 24-year-olds in
          Kanpur — own the calendar they live by. We don't sell freedom. We hand over the
          discipline that creates it.
        </p>
        <p className="mt-3 text-base text-foreground leading-relaxed">
          The AI Advisor is free. The frameworks are free. The brochures are free. Our 12-week batch
          and done-for-you services are how we keep the lights on, and even those are priced
          for Indian founders, not American ones.
        </p>

        <h2 className="mt-12 font-display text-2xl md:text-3xl text-primary">Who built this</h2>
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 md:p-10">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-display font-semibold text-xl">
              AK
            </div>
            <div>
              <h3 className="font-display text-2xl text-primary">
                Captain Ankur Kulshrestha (Retd)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Founder &amp; Lead Mentor · 27 years, Indian Navy (1997 – Feb 2025)
              </p>
              <a
                href="https://www.linkedin.com/in/captainankurkulshrestha"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-xs text-accent hover:underline"
              >
                LinkedIn → /in/captainankurkulshrestha
              </a>
            </div>
          </div>

          {/* Why this matters to YOU */}
          <p className="mt-6 text-[15px] text-foreground leading-relaxed">
            <strong>Why does Captain's background matter to you?</strong> Because the same
            three skills that get a warship safely from Kochi to Port Blair also get a
            first-time founder from Day 1 to first paying client: clarity under pressure,
            ruthless prioritisation, and systems that don't break when one person is having a
            bad week. Twenty-seven years of running that for the Indian Navy. Five years of
            running it for a ₹950 Cr retail operation. Now full-time on handing it over.
          </p>

          {/* Five things that establish trust */}
          <div className="mt-7">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
              Five things that matter for what we'll teach you
            </p>
            <ul className="mt-3 space-y-3 text-[15px] text-foreground leading-relaxed">
              <li>
                <strong>Commanding Officer of an Indian Naval warship (2010–11).</strong>{" "}
                Chief of Naval Staff Commendation. Means: comfortable taking final
                responsibility when things go wrong — the same instinct your first client will
                pay you for.
              </li>
              <li>
                <strong>Commander, Maritime Operations Centre, Navy War Room (2017–19).</strong>{" "}
                Coordinated naval missions and inter-agency disaster response (cyclone, SAR,
                civilian evacuation). Means: knows how to think when 5 different agencies need
                different things at the same time — exactly your first 5 clients.
              </li>
              <li>
                <strong>
                  Director of Operations, NavMart Delhi (2019–25) — ₹950 Cr retail across 60,000
                  sq ft, India's first 24×7 digitally-enhanced defence store.
                </strong>{" "}
                Means: actually built a real business with real numbers, not just talked
                about it.
              </li>
              <li>
                <strong>
                  MBA (Financial Management) — Silver Medallist, awarded by the Finance
                  Minister of India.
                </strong>{" "}
                Means: when we talk about pricing, GST, working capital, and Indian B2B
                payment cycles, the answers come from someone who actually understands
                Indian finance — not a US-trained MBA quoting Stanford case studies.
              </li>
              <li>
                <strong>
                  Member, Board of Studies (BSc Beauty &amp; Wellness), University of Mumbai ·
                  MEPSC affiliate.
                </strong>{" "}
                Means: the certificate you receive on capstone is real, recognised, and
                designed under the Management &amp; Entrepreneurship and Professional Skills
                Council framework.
              </li>
            </ul>
          </div>

          {/* Why this work */}
          <div className="mt-8 rounded-xl bg-accent/5 border border-accent/30 p-5">
            <p className="text-[15px] text-foreground italic leading-relaxed">
              "After 27 years of running operations where a missed detail costs lives, the
              hardest part of retirement was watching brilliant Indian professionals stay
              stuck in average lives because nobody handed them a system. I chose to teach
              first-time Indian founders full-time instead of joining corporate boards. A
              handover, not a programme."
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              — Capt Ankur Kulshrestha (Retd)
            </p>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Full CV available on request via WhatsApp. Education includes the National Defence
            Academy, Defence Services Staff College Wellington, MSc Defence &amp; Strategic
            Studies (Madras), Executive Program in Financial Management &amp; Governance
            (University of California, Riverside), PGDM Disaster Management, and Certificate
            in International HR &amp; Finance (Indian Institute of Foreign Trade, 2024–25).
          </p>
        </div>

        <h2 className="mt-12 font-display text-2xl md:text-3xl text-primary">Our co-leads</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link
            to="/stories/$slug"
            params={{ slug: "bhavna-srivastava" }}
            className="rounded-2xl border border-border bg-card p-6 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
                BS
              </div>
              <div>
                <h3 className="font-display text-lg text-primary">Bhavna Srivastava</h3>
                <p className="text-xs text-muted-foreground">BH Wellness Group</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground">
              Leads the Return-to-Work batch track. From 1:1 wellness coach to 50,000+ lives
              touched.
            </p>
            <p className="mt-3 text-xs text-accent">Read her story →</p>
          </Link>

          <Link
            to="/stories/$slug"
            params={{ slug: "ruchii" }}
            className="rounded-2xl border border-border bg-card p-6 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
                R
              </div>
              <div>
                <h3 className="font-display text-lg text-primary">Ruchii</h3>
                <p className="text-xs text-muted-foreground">The Sales Knob · Google Partner</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-foreground">
              Leads marketing &amp; sales-enablement track. From in-house marketer to Google
              Partner agency owner.
            </p>
            <p className="mt-3 text-xs text-accent">Read her story →</p>
          </Link>
        </div>

        <h2 className="mt-12 font-display text-2xl md:text-3xl text-primary">The methodology</h2>
        <p className="mt-4 text-base text-foreground leading-relaxed">
          Everything we teach is captured in two free brochures, distilled from 1,000+ mentees
          across 17 cities. Together they are about 100 pages. Reading takes 90 minutes.
        </p>
        <ul className="mt-4 space-y-2 text-[15px] text-foreground">
          <li>
            <span className="font-medium">Brochure A — "Brilliant People, Average Lives":</span>{" "}
            the why. The 6 archetypes, the 3 truths, the Freedom Trap.
          </li>
          <li>
            <span className="font-medium">Brochure B — "From Job to First Client in 90 Days":</span>{" "}
            the how. Week-by-week plan, niche statement formula, three-tier rate card, GST/Udyam
            timelines, four-tool stack.
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="https://tpclwsivhsqfsmpueslj.supabase.co/storage/v1/object/public/brochure_pdfs/brilliant-people-average-lives.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
          >
            Download Brochure A (PDF)
          </a>
          <a
            href="https://tpclwsivhsqfsmpueslj.supabase.co/storage/v1/object/public/brochure_pdfs/from-job-to-first-client-90-days.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
          >
            Download Brochure B (PDF)
          </a>
        </div>

        <div className="mt-16 rounded-2xl bg-primary text-primary-foreground p-8 md:p-10">
          <h2 className="font-display text-2xl md:text-3xl">Talk to us</h2>
          <p className="mt-3 text-primary-foreground/80">
            Mentoring is free. Always. Start a conversation now — AI Advisor, the batch, or
            WhatsApp directly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/ai-advisor"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Try the AI Advisor
            </Link>
            <Link
              to="/cohort"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary-foreground/30 px-5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              See the batch
            </Link>
            <WhatsAppButton
              context="about_page"
              message="Hi, I have a question after reading the About page."
              label="WhatsApp Captain"
              variant="ghost"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
