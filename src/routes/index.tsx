import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Target,
  IndianRupee,
  FileCheck2,
  CalendarClock,
  Wallet,
  Activity,
  Calculator,
  Scale,
  ArrowRight,
  X as XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { track } from "@/lib/track";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "UGrowth Consultancy — Free Help to Start Your Own Practice in India | Tools, Mentors, Methodology",
      },
      {
        name: "description",
        content:
          "Real methodology from a retired Indian Navy Captain. Free AI advisor, frameworks, and tools to start your consulting or services practice. MEPSC certified.",
      },
      { property: "og:title", content: "UGrowth Consultancy — Start your own practice in India" },
      {
        property: "og:description",
        content:
          "Free AI advisor, frameworks, and tools to start your consulting or services practice. MEPSC certified.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "UGrowth Consultancy Pvt Ltd",
              url: "/",
            },
            {
              "@type": "WebSite",
              name: "UGrowth Consultancy",
              url: "/",
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Is the mentoring really free?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Mentoring is always free. We earn from paid done-for-you services and the cohort programme.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Do I need to sign up to try the AI Advisor?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "No. The first 5 questions are free without signup.",
                  },
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: Home,
});

// -------------------- helpers --------------------

function useSectionView(id: string) {
  const ref = React.useRef<HTMLElement | null>(null);
  const seen = React.useRef(false);
  React.useEffect(() => {
    if (!ref.current || seen.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !seen.current) {
            seen.current = true;
            track("section_view", { section_id: id });
            obs.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [id]);
  return ref;
}

function ctaClick(label: string, destination: string) {
  track("cta_click", { cta_label: label, destination });
}

// -------------------- sections --------------------

function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useSectionView(id);
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id={id}
      className={`py-16 lg:py-24 ${className}`}
    >
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6">{children}</div>
    </section>
  );
}

function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-auto"
      role="img"
      aria-label="Four Indian professionals with a city skyline"
    >
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F1F1EC" />
          <stop offset="1" stopColor="#FAFAF7" />
        </linearGradient>
      </defs>
      <rect width="480" height="360" fill="url(#sky)" />
      {/* skyline */}
      <g fill="#0F2A4A" opacity="0.18">
        <rect x="20" y="180" width="40" height="120" />
        <rect x="65" y="150" width="55" height="150" />
        <rect x="125" y="200" width="35" height="100" />
        <rect x="165" y="130" width="60" height="170" />
        <rect x="230" y="170" width="40" height="130" />
        <rect x="275" y="190" width="50" height="110" />
        <rect x="330" y="140" width="45" height="160" />
        <rect x="380" y="175" width="80" height="125" />
      </g>
      {/* sun */}
      <circle cx="380" cy="90" r="32" fill="#E08A1E" opacity="0.85" />
      {/* ground */}
      <rect x="0" y="298" width="480" height="62" fill="#0F2A4A" opacity="0.08" />
      {/* 4 silhouettes */}
      <g fill="#0F2A4A">
        <g transform="translate(80,200)">
          <circle cx="0" cy="0" r="14" />
          <rect x="-16" y="14" width="32" height="60" rx="6" />
        </g>
        <g transform="translate(170,195)">
          <circle cx="0" cy="0" r="15" />
          <rect x="-17" y="14" width="34" height="65" rx="6" />
        </g>
        <g transform="translate(260,200)" fill="#1A2A44">
          <circle cx="0" cy="0" r="14" />
          <rect x="-16" y="14" width="32" height="60" rx="6" />
        </g>
        <g transform="translate(350,195)">
          <circle cx="0" cy="0" r="15" />
          <rect x="-17" y="14" width="34" height="65" rx="6" />
        </g>
      </g>
      {/* saffron sash highlights */}
      <g fill="#E08A1E">
        <rect x="74" y="220" width="12" height="20" />
        <rect x="344" y="215" width="12" height="22" />
      </g>
    </svg>
  );
}

function BrochureModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get the free playbook</DialogTitle>
          <DialogDescription>
            We'll send the full playbook PDF to your email. Available soon.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <Input type="email" placeholder="you@example.com" disabled />
          <Button
            className="w-full"
            disabled
            onClick={() => ctaClick("brochure_submit", "/brochure")}
          >
            Email it to me
          </Button>
          <p className="text-xs text-muted-foreground">
            Brochure delivery activates in the next release.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Hero() {
  React.useEffect(() => {
    track("homepage_view", {});
  }, []);
  const ref = useSectionView("hero");
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="hero"
      className="relative overflow-hidden border-b border-border"
    >
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
        <div className="order-2 lg:order-1">
          <h1 className="font-display font-semibold text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.1]">
            Free help to start your own practice in India.
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
            Real methodology. Real tools. Real mentors. No catch.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <Link
                to="/ai-advisor"
                onClick={() => ctaClick("hero_primary_ai_advisor", "/ai-advisor")}
              >
                Try the free AI Advisor
              </Link>
            </Button>
            <BrochureModal>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => ctaClick("hero_secondary_brochure", "modal:brochure")}
              >
                Get the free playbook
              </Button>
            </BrochureModal>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <li>Methodology certified by MEPSC, Government of India</li>
            <li>University of Mumbai Board of Studies affiliated</li>
            <li>UGrowth Consultancy Pvt Ltd</li>
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <div className="rounded-2xl overflow-hidden border border-border bg-card">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}

const AUDIENCES = [
  { title: "I have a job. I want to leave.", sub: "Plan your exit with a runway.", slug: "stuck-professional" },
  { title: "I already do work on the side.", sub: "Turn the side hustle into a real practice.", slug: "side-hustler" },
  { title: "I took a break. I want to come back.", sub: "Re-enter on your own terms.", slug: "returning-to-work" },
  { title: "I'm young. I don't want a corporate job.", sub: "Build a practice instead of a CV.", slug: "rising-graduate" },
  { title: "I work with clients. I need a system.", sub: "Pricing, intake, delivery — done right.", slug: "first-gen-consultant" },
  { title: "I'm in a small city. I want to start here.", sub: "Build locally, sell anywhere.", slug: "tier2-dreamer" },
] as const;

function Audience() {
  return (
    <Section id="audience">
      <h2 className="font-display text-3xl md:text-4xl text-primary">Which one is you?</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AUDIENCES.map((a) => (
          <Link
            key={a.slug}
            to="/tracks/$slug"
            params={{ slug: a.slug }}
            onClick={() => ctaClick(`audience_${a.slug}`, `/tracks/${a.slug}`)}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-accent/50"
          >
            <h3 className="font-display text-lg text-primary leading-snug">{a.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{a.sub}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Show me how <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

const STORIES = [
  {
    initials: "BS",
    name: "Bhavna Srivastava",
    org: "BH Wellness Group",
    line: "From 1:1 coach to 50,000+ lives touched.",
    slug: "bhavna-srivastava",
  },
  {
    initials: "R",
    name: "Ruchii",
    org: "The Sales Knob",
    line: "From in-house marketer to Google Partner agency.",
    slug: "ruchii",
  },
] as const;

function Stories() {
  return (
    <Section id="stories" className="bg-secondary/40">
      <h2 className="font-display text-3xl md:text-4xl text-primary">From founders who did this</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {STORIES.map((s) => (
          <Link
            key={s.slug}
            to="/stories/$slug"
            params={{ slug: s.slug }}
            onClick={() => ctaClick(`story_${s.slug}`, `/stories/${s.slug}`)}
            className="rounded-xl border border-border bg-card p-6 hover:shadow-md hover:border-accent/50 transition-all"
          >
            <div className="h-14 w-14 rounded-full bg-accent text-accent-foreground font-display font-semibold text-xl flex items-center justify-center">
              {s.initials}
            </div>
            <h3 className="mt-4 font-display text-lg text-primary">{s.name}</h3>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.org}</p>
            <p className="mt-3 text-sm text-foreground">{s.line}</p>
          </Link>
        ))}
        <div className="rounded-xl border border-dashed border-border bg-transparent p-6 flex flex-col justify-center">
          <h3 className="font-display text-lg text-muted-foreground">More founder stories</h3>
          <p className="mt-2 text-sm text-muted-foreground">joining the wall soon</p>
        </div>
      </div>
    </Section>
  );
}

function AiPreview() {
  return (
    <Section id="ai-preview">
      <div className="max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl text-primary">Try our AI Advisor</h2>
        <p className="mt-3 text-muted-foreground">
          Ask any question about starting or running your practice. Free, no signup needed for the
          first 5 questions.
        </p>
      </div>
      <div className="mt-8 max-w-3xl space-y-3">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-accent/15 px-4 py-3 text-sm">
            How much should I charge for a 1-hour consulting session?
          </div>
        </div>
        <div className="flex">
          <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
            Start with the Three-Tier Rate Card framework. Build three prices: a starter rate
            (entry option clients can say yes to easily), a standard rate (where you actually want
            most clients), and an anchor premium rate (frames the standard as reasonable). For a
            1-hour consulting session in India, typical bands by experience are{" "}
            {formatINR(1500, { withSymbol: true })}/{formatINR(2500, { withSymbol: false })}/
            {formatINR(5000, { withSymbol: false })} (early career),{" "}
            {formatINR(3000, { withSymbol: true })}/{formatINR(5000, { withSymbol: false })}/
            {formatINR(10000, { withSymbol: false })} (5+ years),{" "}
            {formatINR(6000, { withSymbol: true })}/{formatINR(12000, { withSymbol: false })}/
            {formatINR(25000, { withSymbol: false })} (senior). The anchoring matters more than
            the absolute number. Try the Rate Card Builder for your specific niche.
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button asChild>
          <Link
            to="/ai-advisor"
            onClick={() => ctaClick("ai_preview_start_conversation", "/ai-advisor")}
          >
            Start your own conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

const TOOLS = [
  { icon: Target, title: "Niche Statement Generator", desc: "Find your kind of customer in 5 minutes", slug: "niche-generator" },
  { icon: IndianRupee, title: "Three-Tier Rate Card Builder", desc: "What should you charge? Find out", slug: "rate-card-builder" },
  { icon: FileCheck2, title: "GST Eligibility Checker", desc: "Do you need GST? Quick test", slug: "gst-checker" },
  { icon: CalendarClock, title: "Compliance Calendar", desc: "What's your next deadline?", slug: "compliance-calendar" },
  { icon: Wallet, title: "Working Capital Calculator", desc: "How much do clients owe you?", slug: "working-capital" },
  { icon: Activity, title: "Founder Vital Signs Check", desc: "How healthy is your business?", slug: "vital-signs" },
  { icon: Calculator, title: "Pricing Calculator", desc: "Real market rates in your city", slug: "pricing-calculator" },
  { icon: Scale, title: "Should-I-Switch Calculator", desc: "Is JustDial / IndiaMART worth it for you?", slug: "should-i-switch" },
] as const;

function Tools() {
  return (
    <Section id="tools" className="bg-secondary/40">
      <h2 className="font-display text-3xl md:text-4xl text-primary">
        Free tools that solve real problems in 5 minutes
      </h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TOOLS.map((t) => (
          <Link
            key={t.slug}
            to="/tools/$slug"
            params={{ slug: t.slug }}
            onClick={() => ctaClick(`tool_${t.slug}`, `/tools/${t.slug}`)}
            className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-accent/50 transition-all flex flex-col"
          >
            <t.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-4 font-display text-base text-primary leading-snug">{t.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{t.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Try it free <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function CohortBlock() {
  const [cohort, setCohort] = React.useState<{
    name: string;
    max_seats: number;
    remaining: number;
    start_date: string | null;
  } | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cohorts")
        .select("id, name, max_seats, start_date")
        .eq("is_open", true)
        .order("application_deadline", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (data) {
        const { count } = await supabase
          .from("cohort_applications")
          .select("id", { count: "exact", head: true })
          .eq("cohort_id", data.id)
          .in("screening_status", ["accepted"]);
        setCohort({
          name: data.name,
          max_seats: data.max_seats,
          remaining: data.max_seats - (count ?? 0),
          start_date: data.start_date,
        });
      }
      setLoaded(true);
    })();
  }, []);

  return (
    <Section id="cohort">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-primary">Our 12-week training</h2>
          <ul className="mt-6 space-y-3 text-sm text-foreground">
            <li>• 6 weeks foundation — methodology, mindset, market</li>
            <li>• 4 weeks brand + pricing — niche, rate card, positioning</li>
            <li>• 2 weeks first client outreach — pipeline, intake, close</li>
            <li>• Capstone project — your first real engagement</li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Government-recognised certification (MEPSC NSQF Level 5).
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Next batch</p>
          <p className="mt-2 font-display text-2xl text-primary">
            {loaded ? (cohort?.name ?? "TBA") : "Loading…"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Seats</p>
              <p className="font-medium text-foreground">
                {cohort ? `${cohort.remaining}/${cohort.max_seats}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium text-foreground">
                {formatINR(30000)}{" "}
                <span className="text-xs text-muted-foreground">
                  ({formatINR(35000)} from Cohort 2)
                </span>
              </p>
            </div>
          </div>
          <Button className="mt-6 w-full" asChild>
            <Link to="/apply" onClick={() => ctaClick("cohort_apply", "/apply")}>
              Apply for the next batch <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

const SERVICES = [
  { name: "GST Registration", line: "Get GSTIN in 7 days", price: 1999, slug: "gst-registration" },
  { name: "Udyam Registration", line: "MSME certificate, same week", price: 999, slug: "udyam-registration" },
  { name: "Pvt Ltd Incorporation", line: "Company in 10–14 days", price: 6999, slug: "pvt-ltd-incorporation" },
  { name: "LLP Incorporation", line: "Limited liability partnership", price: 4999, slug: "llp-incorporation" },
  { name: "ROC Annual Filings", line: "Stay compliant, year-round", price: 6999, slug: "roc-annual-filings" },
  { name: "EPF Setup", line: "Employer EPF registration", price: 4999, slug: "epf-setup" },
  { name: "Trademark Filing", line: "Protect your brand name", price: 4999, slug: "trademark-filing" },
  { name: "FSSAI Registration", line: "Food business licence", price: 2499, slug: "fssai-registration" },
] as const;

function Services() {
  return (
    <Section id="services" className="bg-secondary/40">
      <h2 className="font-display text-3xl md:text-4xl text-primary">
        We do the boring stuff for you
      </h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SERVICES.map((s) => (
          <Link
            key={s.slug}
            to="/services/$slug"
            params={{ slug: s.slug }}
            onClick={() => ctaClick(`service_${s.slug}`, `/services/${s.slug}`)}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-accent/50 transition-all flex flex-col"
          >
            <h3 className="font-display text-base text-primary">{s.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{s.line}</p>
            <p className="mt-4 font-display text-xl text-primary">{formatINR(s.price)}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Get this done <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function TeaserBanner({
  id,
  heading,
  cta,
  to,
  trackLabel,
}: {
  id: string;
  heading: string;
  cta: string;
  to: string;
  trackLabel: string;
}) {
  const ref = useSectionView(id);
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id={id}
      className="py-10 border-t border-border"
    >
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <p className="text-base md:text-lg text-foreground max-w-3xl">{heading}</p>
        <Link
          to={to}
          onClick={() => ctaClick(trackLabel, to)}
          className="inline-flex items-center gap-1 font-medium text-accent whitespace-nowrap"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Newsletter() {
  const ref = useSectionView("newsletter");
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErr("Please enter a valid email.");
      return;
    }
    setBusy(true);
    const { error } = await supabase
      .from("waitlists")
      .insert({ email: clean, product_interested_in: "newsletter" });
    setBusy(false);
    if (error) {
      setErr("Something went wrong. Try again.");
      return;
    }
    ctaClick("newsletter_subscribe", "waitlists");
    setDone(true);
  }

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="newsletter"
      className="py-16 lg:py-24 border-t border-border"
    >
      <div className="mx-auto max-w-2xl px-4 lg:px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-primary">
          Free weekly insights for Indian founders
        </h2>
        <p className="mt-3 text-muted-foreground">
          1 useful template + 1 honest piece of advice. No spam, no upsells.
        </p>
        {done ? (
          <p className="mt-8 text-success font-medium">
            Thanks. We'll send the first email next Tuesday.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
            />
            <Button type="submit" disabled={busy} className="sm:w-auto">
              {busy ? "Subscribing…" : "Subscribe"}
            </Button>
          </form>
        )}
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <p className="mt-4 text-xs text-muted-foreground">
          By subscribing you agree to our{" "}
          <Link to="/privacy" className="underline hover:text-accent">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

function FinalCta() {
  const ref = useSectionView("final_cta");
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="final-cta"
      className="bg-primary text-primary-foreground py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 text-center">
        <h2 className="font-display text-3xl md:text-5xl text-primary-foreground">
          Mentoring is free. Always. Get started today.
        </h2>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" asChild>
            <Link
              to="/ai-advisor"
              onClick={() => ctaClick("final_primary_ai_advisor", "/ai-advisor")}
            >
              Try the AI Advisor <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <BrochureModal>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => ctaClick("final_secondary_brochure", "modal:brochure")}
            >
              Get the playbook
            </Button>
          </BrochureModal>
        </div>
      </div>
    </section>
  );
}

function StickyMobileCta() {
  const [show, setShow] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (dismissed || !show) return null;
  return (
    <div className="lg:hidden fixed bottom-3 inset-x-3 z-40">
      <div className="flex items-center gap-2 rounded-full bg-accent text-accent-foreground shadow-lg pl-4 pr-2 py-2">
        <Link
          to="/ai-advisor"
          onClick={() => ctaClick("sticky_mobile_ai_advisor", "/ai-advisor")}
          className="flex-1 text-sm font-medium"
        >
          Try AI Advisor (free)
        </Link>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => setDismissed(true)}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-black/10"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <Audience />
      <Stories />
      <AiPreview />
      <Tools />
      <CohortBlock />
      <Services />
      <TeaserBanner
        id="practice-launch"
        heading="Launch your first 10 clients with a real marketing engine. AI + a real human. Indian context. ₹4,999/month."
        cta="See how it works"
        to="/services/practice-launch"
        trackLabel="teaser_practice_launch"
      />
      <TeaserBanner
        id="circles"
        heading="Don't do this alone. Join a curated circle of 10 other Indian founders in your city. Weekly Zoom + monthly chai meetup."
        cta="Find your circle"
        to="/circles"
        trackLabel="teaser_circles"
      />
      <Newsletter />
      <FinalCta />
      <StickyMobileCta />
    </>
  );
}
