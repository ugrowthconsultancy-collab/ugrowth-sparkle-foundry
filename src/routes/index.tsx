import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Target,
  IndianRupee,
  FileCheck2,
  CalendarClock,
  Wallet,
  Activity,
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
          "Real methodology from a retired Indian Navy Captain. Free AI advisor, frameworks, and tools to start your own practice in India. 12-week batch with MEPSC Certificate in Professional, Business and Management Consultancy on capstone.",
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
                    text: "Yes. Mentoring is always free. We earn from paid done-for-you services and the 12-week batch.",
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

const BROCHURE_BASE =
  "https://tpclwsivhsqfsmpueslj.supabase.co/storage/v1/object/public/brochure_pdfs";

function BrochureModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get the free playbook</DialogTitle>
          <DialogDescription>
            Both brochures are free. No email gate, no signup. Captain wants you to read these
            before you decide if the 12-week batch is for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <a
            href={`${BROCHURE_BASE}/brilliant-people-average-lives.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ctaClick("brochure_download_a", "brochure_a.pdf")}
            className="block rounded-lg border border-border bg-card p-4 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📘</div>
              <div className="flex-1">
                <p className="font-display text-base text-primary">
                  Brochure A — Brilliant People, Average Lives
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The why. 42 pages. The 6 archetypes, 3 truths, the Freedom Trap.
                </p>
              </div>
              <span className="text-xs text-accent font-medium shrink-0">PDF →</span>
            </div>
          </a>
          <a
            href={`${BROCHURE_BASE}/from-job-to-first-client-90-days.pdf`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ctaClick("brochure_download_b", "brochure_b.pdf")}
            className="block rounded-lg border border-border bg-card p-4 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📗</div>
              <div className="flex-1">
                <p className="font-display text-base text-primary">
                  Brochure B — From Job to First Client in 90 Days
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  The how. 58 pages. Week-by-week plan, rate card, GST timelines, tool stack.
                </p>
              </div>
              <span className="text-xs text-accent font-medium shrink-0">PDF →</span>
            </div>
          </a>
          <p className="text-xs text-muted-foreground pt-1">
            Free forever. Share them with anyone you think they'd help.
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
  const { t } = useTranslation();
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
            {t("hero.title")}
          </h1>
          <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl">
            {t("hero.subtitle")}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild>
              <Link
                to="/ai-advisor"
                onClick={() => ctaClick("hero_primary_ai_advisor", "/ai-advisor")}
              >
                {t("hero.ctaPrimary")}
              </Link>
            </Button>
            <BrochureModal>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => ctaClick("hero_secondary_brochure", "modal:brochure")}
              >
                {t("hero.ctaSecondary")}
              </Button>
            </BrochureModal>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <li>{t("hero.badge1")}</li>
            <li>{t("hero.badge2")}</li>
            <li>{t("hero.badge3")}</li>
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

const AUDIENCE_SLUGS = [
  "stuck-professional",
  "side-hustler",
  "returning-to-work",
  "rising-graduate",
  "first-gen-consultant",
  "tier2-dreamer",
] as const;

function Audience() {
  const { t } = useTranslation();
  return (
    <Section id="audience">
      <h2 className="font-display text-3xl md:text-4xl text-primary">{t("audience.title")}</h2>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AUDIENCE_SLUGS.map((slug) => (
          <Link
            key={slug}
            to="/tracks/$slug"
            params={{ slug }}
            onClick={() => ctaClick(`audience_${slug}`, `/tracks/${slug}`)}
            className="group rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-accent/50"
          >
            <h3 className="font-display text-lg text-primary leading-snug">
              {t(`audience.items.${slug}.title`)}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(`audience.items.${slug}.sub`)}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
              {t("audience.showMe")} <ArrowRight className="h-4 w-4" />
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
  const { t } = useTranslation();
  return (
    <Section id="stories" className="bg-secondary/40">
      <h2 className="font-display text-3xl md:text-4xl text-primary">{t("stories.title")}</h2>
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
        <Link
          to="/apply"
          onClick={() => ctaClick("story_become_one", "/apply")}
          className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-6 flex flex-col justify-center hover:bg-accent/10 hover:border-accent transition-colors"
        >
          <h3 className="font-display text-lg text-primary">Be the next story</h3>
          <p className="mt-2 text-sm text-foreground">
            Cohort 1 applications are open. 25 seats. Captain personally reviews every application.
          </p>
          <p className="mt-3 text-sm text-accent font-medium">Apply for the next batch →</p>
        </Link>
      </div>
    </Section>
  );
}

function AiPreview() {
  const { t } = useTranslation();
  return (
    <Section id="ai-preview">
      <div className="max-w-3xl">
        <h2 className="font-display text-3xl md:text-4xl text-primary">{t("ai.title")}</h2>
        <p className="mt-3 text-muted-foreground">{t("ai.subtitle")}</p>
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
            {t("ai.start")} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

const TOOLS = [
  {
    icon: Target,
    title: "Niche Statement Generator",
    desc: "Answer 4 fields. Get a niche line you can put on LinkedIn today.",
    slug: "niche-generator",
    live: true,
  },
  {
    icon: IndianRupee,
    title: "Three-Tier Rate Card Builder",
    desc: "Real Indian market rates by city tier + experience. Print-ready.",
    slug: "rate-card-builder",
    live: true,
  },
  {
    icon: FileCheck2,
    title: "GST Eligibility Checker",
    desc: "Do you actually need GST? 5-question diagnostic.",
    slug: "gst-checker",
    live: true,
  },
  {
    icon: Wallet,
    title: "Working Capital Calculator",
    desc: "How much money are your clients sitting on?",
    slug: "working-capital",
    live: true,
  },
  {
    icon: Activity,
    title: "Founder Vital Signs",
    desc: "10 questions. Score 0–100. Where your practice is fragile.",
    slug: "vital-signs",
    live: true,
  },
  {
    icon: CalendarClock,
    title: "Compliance Calendar",
    desc: "GST, TDS, ROC dates for the next 12 months, your business type.",
    slug: "compliance-calendar",
    live: true,
  },
] as const;

function Tools() {
  const { t } = useTranslation();
  return (
    <Section id="tools" className="bg-secondary/40">
      <h2 className="font-display text-3xl md:text-4xl text-primary">{t("tools.title")}</h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
        All free, all under 5 minutes, all built for Indian founders. No login, no email gate.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            to="/tools/$slug"
            params={{ slug: tool.slug }}
            onClick={() => ctaClick(`tool_${tool.slug}`, `/tools/${tool.slug}`)}
            className="group rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-accent/50 transition-all flex flex-col"
          >
            <tool.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-4 font-display text-base text-primary leading-snug">{tool.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{tool.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
              {t("tools.tryFree")} <ArrowRight className="h-4 w-4" />
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

  const { t } = useTranslation();
  return (
    <Section id="cohort">
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="font-display text-3xl md:text-4xl text-primary">{t("cohort.title")}</h2>
          <ul className="mt-6 space-y-3 text-sm text-foreground">
            <li>• {t("cohort.b1")}</li>
            <li>• {t("cohort.b2")}</li>
            <li>• {t("cohort.b3")}</li>
            <li>• {t("cohort.b4")}</li>
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">{t("cohort.cert")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 lg:p-8">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{t("cohort.next")}</p>
          <p className="mt-2 font-display text-2xl text-primary">
            {loaded ? (cohort?.name ?? t("cohort.tba")) : t("cohort.loading")}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t("cohort.seats")}</p>
              <p className="font-medium text-foreground">
                {cohort ? `${cohort.remaining}/${cohort.max_seats}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("cohort.price")}</p>
              <p className="font-medium text-foreground">
                {formatINR(30000)}{" "}
                <span className="text-xs text-muted-foreground">
                  {t("cohort.priceNote", { next: formatINR(35000) })}
                </span>
              </p>
            </div>
          </div>
          <Button className="mt-6 w-full" asChild>
            <Link to="/apply" onClick={() => ctaClick("cohort_apply", "/apply")}>
              {t("cohort.apply")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

const SERVICES = [
  { name: "GST Registration", line: "GSTIN in 7 working days", price: 1999, slug: "gst-registration" },
  { name: "Udyam Registration", line: "MSME certificate, same week", price: 999, slug: "udyam-registration" },
  { name: "Pvt Ltd Incorporation", line: "Company in 10–14 days", price: 6999, slug: "pvt-ltd" },
  { name: "LLP Incorporation", line: "Limited liability partnership", price: 4999, slug: "llp" },
  { name: "ROC Annual Filings", line: "Stay compliant, year-round", price: 6999, slug: "roc-annual-filing" },
  { name: "EPF Setup", line: "Employer EPF registration", price: 4999, slug: "epf-setup" },
  { name: "Trademark Filing", line: "Protect your brand name", price: 4999, slug: "trademark-filing" },
  { name: "FSSAI Registration", line: "Food business licence", price: 2499, slug: "fssai-registration" },
] as const;

function Services() {
  const { t } = useTranslation();
  return (
    <Section id="services" className="bg-secondary/40">
      <h2 className="font-display text-3xl md:text-4xl text-primary">{t("services.title")}</h2>
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
              {t("services.getThis")} <ArrowRight className="h-4 w-4" />
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
        <a
          href={to}
          onClick={() => ctaClick(trackLabel, to)}
          className="inline-flex items-center gap-1 font-medium text-accent whitespace-nowrap"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </a>
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

function CaptainAccess() {
  const ref = useSectionView("captain_access");
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="captain-access"
      className="border-y border-border bg-accent/5"
    >
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-10 md:py-14">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
          Three ways to learn from Captain
        </p>
        <h2 className="mt-2 font-display text-2xl md:text-3xl text-primary">
          Free, paid-once, or the full 12 weeks. Your call.
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link
            to="/ai-advisor"
            onClick={() => ctaClick("captain_access_ai", "/ai-advisor")}
            className="rounded-xl border border-border bg-card p-5 hover:border-accent transition-colors"
          >
            <p className="font-display text-base text-primary">AI Advisor · free, 24×7</p>
            <p className="mt-2 text-sm text-foreground leading-relaxed">
              Captain's methodology trained into a chatbot. 30 messages a day free. English,
              Hindi, Hinglish.
            </p>
            <p className="mt-3 text-xs text-accent font-medium">Start chatting →</p>
          </Link>
          <Link
            to="/workshops"
            onClick={() => ctaClick("captain_access_workshops", "/workshops")}
            className="rounded-xl border border-border bg-card p-5 hover:border-accent transition-colors"
          >
            <p className="font-display text-base text-primary">
              Thursday workshops · 4–5 PM IST
            </p>
            <p className="mt-2 text-sm text-foreground leading-relaxed">
              Live 1-hour session with Captain every Thursday — one topic at a time
              (pricing, outreach, niche, GST). ₹1,500–₹2,500.
            </p>
            <p className="mt-3 text-xs text-accent font-medium">See this week's topic →</p>
          </Link>
          <Link
            to="/cohort"
            onClick={() => ctaClick("captain_access_batch", "/cohort")}
            className="rounded-xl border border-border bg-card p-5 hover:border-accent transition-colors"
          >
            <p className="font-display text-base text-primary">12-week batch · ₹30,000</p>
            <p className="mt-2 text-sm text-foreground leading-relaxed">
              Captain personally for 12 weeks, capstone defence, MEPSC certificate. 20–25
              founders per batch. 100% refund by Day 90.
            </p>
            <p className="mt-3 text-xs text-accent font-medium">See the batch →</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CaptainOpenHour() {
  const ref = useSectionView("captain_open_hour");
  const url = `https://wa.me/919650297779?text=${encodeURIComponent(
    "Hi Captain, I want to join the next Friday open WhatsApp hour. My question is: ",
  )}`;
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="captain-open-hour"
      className="bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-10 md:py-12 grid md:grid-cols-[1fr_auto] gap-6 items-center">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Captain's open WhatsApp hour — free
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl text-primary-foreground">
            Every Friday · 7–8 PM IST · ask Captain anything, no fee.
          </h2>
          <p className="mt-3 text-sm md:text-base text-primary-foreground/80 max-w-2xl leading-relaxed">
            One hour a week, Captain answers questions personally on WhatsApp — niche,
            pricing, exits, family conversations, refunds, GST, the awkward stuff. No batch
            fee. No application. Send the question by Friday 4 PM and we'll add you to the
            circle.
          </p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => ctaClick("captain_open_hour_whatsapp", "wa.me")}
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent/90 whitespace-nowrap"
        >
          Send my question →
        </a>
      </div>
    </section>
  );
}

function ProofStrip() {
  const ref = useSectionView("proof_strip");
  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="proof-strip"
      className="border-b border-border bg-card"
    >
      <div className="mx-auto max-w-[1280px] px-4 lg:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {[
          { n: "1,000+", l: "founders mentored across 17 Indian cities" },
          { n: "100 pages", l: "of free playbook — yours, no email gate" },
          { n: "27 years", l: "Indian Navy + retail leadership behind Captain" },
          { n: "Day 90", l: "or 100% refund if no path to a paying client" },
        ].map((s) => (
          <div key={s.l}>
            <p className="font-display text-2xl md:text-3xl text-primary">{s.n}</p>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-snug">{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <Audience />
      <CaptainAccess />
      <CaptainOpenHour />
      <Stories />
      <AiPreview />
      <Tools />
      <CohortBlock />
      <Services />
      <TeaserBanner
        id="practice-launch"
        heading="Never miss another GST or ROC deadline. Our monthly compliance subscription handles GSTR-1, GSTR-3B, TDS and AOC-4 / MGT-7 filings — ₹2,499/month, cancel anytime."
        cta="See the subscription"
        to="/services/compliance-subscription"
        trackLabel="teaser_compliance_subscription"
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
