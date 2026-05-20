import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

type Story = {
  slug: string;
  name: string;
  role: string;
  initials: string;
  city: string;
  oneLiner: string;
  archetype: string;
  paragraphs: string[];
  proof: { label: string; value: string }[];
  pullQuote: string;
  whatSheTeaches: string[];
};

const STORIES: Record<string, Story> = {
  "bhavna-srivastava": {
    slug: "bhavna-srivastava",
    name: "Bhavna Srivastava",
    role: "Co-lead, Return-to-Work track · Founder, BH Wellness Group",
    initials: "BS",
    city: "Delhi NCR",
    oneLiner:
      "From a 1:1 wellness coach charging ₹500/session to a multi-vertical wellness group touching 50,000+ lives — built entirely after a career break.",
    archetype: "Return-to-Work Founder",
    paragraphs: [
      "Bhavna spent her early career in corporate HR. Then came marriage, a move, two kids, and what she calls \"the quiet decade\" — six years out of the workforce, raising her family, picking up yoga and nutrition certifications on the side because she missed having a mind of her own.",
      "When she tried to re-enter, every interview ended with the same coded sentence: \"We're looking for someone more recent.\" She stopped applying. Started teaching yoga in her living room. Charged ₹500 a session. Eight aunties showed up.",
      "Within 18 months — without a corporate job, without a co-founder, without a single rupee of outside funding — those eight aunties became a 60-person weekly programme. She added nutrition. Then mental wellness. Then corporate D&I sessions on women's health for companies in Gurugram and Noida.",
      "Today BH Wellness Group runs 4 verticals — yoga, nutrition, mental wellness, corporate D&I — and Bhavna estimates she has touched 50,000+ lives through her programmes, workshops, and content. She works from her own home, sets her own calendar, and the corporate world that wouldn't return her calls now hires her at ₹3L+ per engagement.",
      "She joined UGrowth Consultancy as co-lead specifically to mentor women in the same trap she escaped — the assumption that a career gap closes doors permanently. \"It opens them, actually. Just not the ones you thought you wanted.\"",
    ],
    proof: [
      { label: "Years off before restart", value: "6" },
      { label: "First session price", value: "₹500" },
      { label: "Today's corporate rate", value: "₹3L+" },
      { label: "Lives touched", value: "50,000+" },
      { label: "Verticals built", value: "4" },
    ],
    pullQuote:
      "The gap isn't a hole on your CV. It's where your real customers live. The mothers, the colleagues' wives, the local community — they ARE the market. You just stopped seeing them as one.",
    whatSheTeaches: [
      "How to convert a career-break network into your first 10 paying customers",
      "Workshop pricing that respects your time without scaring off your community",
      "Building corporate D&I packages from a home base, no agency, no LinkedIn ad spend",
      "How to defend the gap in proposals — turn it into your strongest sales line",
    ],
  },
  "ruchii": {
    slug: "ruchii",
    name: "Ruchii",
    role: "Co-lead, Marketing & Sales Enablement track · Founder, The Sales Knob (Google Partner)",
    initials: "R",
    city: "Bangalore",
    oneLiner:
      "Went from in-house marketer at three SaaS companies to running a Google Premier Partner agency serving 40+ Indian B2B clients — in under 4 years.",
    archetype: "First-Gen Consultant",
    paragraphs: [
      "Ruchii spent seven years in-house — first at a Mumbai-based fintech, then at two B2B SaaS companies in Bangalore. She ran growth, demand generation, and paid acquisition. She watched her CEOs raise rounds on the back of pipelines SHE built and quietly wondered why she was being paid in shares that hadn't liquidity-evented.",
      "She quit her last job in 2021 with three months of runway and one signed retainer (₹40k/month). Her thesis was simple: there are 50,000 Indian B2B SaaS / D2C companies who can't afford a full marketing team but desperately need someone who actually understands B2B funnels. Agencies were either huge and expensive, or tiny and clueless. Nobody was in the middle.",
      "Within 12 months she had 8 clients. Within 24, she had 22 and her own 6-person team. Today The Sales Knob is a Google Premier Partner — one of a handful of small Indian agencies with that designation — and Ruchii personally runs ₹40Cr+ of paid media annually for Indian B2B brands.",
      "What sets her apart in the founder-mentor circuit is that she has zero patience for vanity. She talks about pipeline, CAC, payback period, and gross margin — not about \"branding\" or \"storytelling\" in the abstract. She's the person Captain calls when a batch founder needs to actually win clients, not just build a pretty website.",
      "She joined UGrowth to teach the part most founders skip: how to sell. Not pitch. Sell.",
    ],
    proof: [
      { label: "Runway when she quit", value: "3 months" },
      { label: "First retainer", value: "₹40k/mo" },
      { label: "Clients in year 1", value: "8" },
      { label: "Clients in year 2", value: "22" },
      { label: "Team today", value: "6" },
      { label: "Status", value: "Google Premier Partner" },
    ],
    pullQuote:
      "Indian founders romanticise branding. Your first 5 clients don't care about your brand. They care whether you can show them, by Wednesday, three names and phone numbers of people who will pay them money. That's it.",
    whatSheTeaches: [
      "Writing a sales-led website (not a brand-led one) for your first ₹50L of revenue",
      "Cold outreach that gets reply rates above 12% — the templates and the timing",
      "Building a discovery call playbook that ends in a signed proposal 40%+ of the time",
      "Pricing for B2B India — what corporates actually pay vs. what consultants under-charge",
    ],
  },
};

export const Route = createFileRoute("/stories/$slug")({
  loader: ({ params }) => {
    const story = STORIES[params.slug];
    if (!story) throw notFound();
    return { story };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.story.name} — UGrowth Consultancy` },
      { name: "description", content: loaderData?.story.oneLiner ?? "" },
    ],
  }),
  component: StoryPage,
});

function StoryPage() {
  const { story } = Route.useLoaderData();
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-3xl">
        <Link to="/about" className="text-xs text-muted-foreground hover:text-primary">
          ← About the team
        </Link>

        <div className="mt-6 flex items-start gap-4">
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-xl font-semibold">
            {story.initials}
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Founder Story
            </p>
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold text-primary leading-tight">
              {story.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{story.role}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {story.city} · Archetype: {story.archetype}
            </p>
          </div>
        </div>

        <p className="mt-8 text-lg text-foreground leading-relaxed">{story.oneLiner}</p>

        {/* Proof strip */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
          {story.proof.map((p) => (
            <div key={p.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {p.label}
              </p>
              <p className="mt-1 font-display text-lg text-primary">{p.value}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="mt-12 space-y-5">
          {story.paragraphs.map((p, i) => (
            <p key={i} className="text-[16px] text-foreground leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {/* Pull quote */}
        <blockquote className="mt-12 border-l-4 border-accent bg-card p-6 italic text-lg text-foreground leading-relaxed">
          "{story.pullQuote}"
        </blockquote>

        {/* What she teaches */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-primary">What {story.name.split(" ")[0]} teaches in the batch</h2>
          <ul className="mt-4 space-y-2 text-[15px] text-foreground list-disc list-inside marker:text-accent">
            {story.whatSheTeaches.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-primary text-primary-foreground p-8">
          <h3 className="font-display text-2xl">
            Want {story.name.split(" ")[0]} on your batch?
          </h3>
          <p className="mt-3 text-primary-foreground/80 leading-relaxed">
            She co-teaches every batch alongside Captain. Apply for the next batch or
            WhatsApp us with questions.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/apply"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Apply for the next batch →
            </Link>
            <Link
              to="/cohort"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary-foreground/30 px-5 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            >
              See the batch
            </Link>
            <WhatsAppButton
              context={`story_${story.slug}_cta`}
              message={`Hi, I read ${story.name}'s story. I have a question.`}
              label="WhatsApp us"
              variant="ghost"
              className="text-primary-foreground hover:text-accent"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
