import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

type Track = {
  slug: string;
  kicker: string;
  title: string;
  oneLiner: string;
  meta: string;
  voice: string;
  signs: string[];
  truth: string;
  ninetyDay: string[];
  rateCard: { tier: string; price: string; for: string }[];
  pitfall: string;
  cta: string;
};

const TRACKS: Record<string, Track> = {
  "stuck-professional": {
    slug: "stuck-professional",
    kicker: "Archetype 1 of 6",
    title: "The Stuck Professional",
    oneLiner:
      "You're 28–42, well-paid, well-respected, and quietly sick of it. The Sunday-night dread is real.",
    meta: "For: salaried mid-career professionals in Bangalore / Mumbai / Pune / Delhi.",
    voice:
      "\"I make ₹35 LPA. The work has no meaning anymore. I've been thinking of leaving for two years but the EMIs and the parents and the spouse and the optics keep me in.\"",
    signs: [
      "You browse \"how to start consulting\" tabs during stand-up.",
      "You can teach what your CEO does, but you call yourself \"just\" an XYZ.",
      "Every offsite ends with the same internal monologue: I should just quit.",
      "You have ₹6–24 lakh in savings and you've already done the math.",
    ],
    truth:
      "Freedom isn't quitting. Freedom is having a paying client before you quit. The Stuck Professional who waits for \"perfect timing\" is still stuck five years from now.",
    ninetyDay: [
      "Weeks 1–4: Self-audit. Pick one niche (industry × problem you've solved repeatedly at work).",
      "Weeks 5–8: Build the LinkedIn presence + three-tier rate card. Soft-launch to your network.",
      "Weeks 9–12: 20 warm conversations → 5 discovery calls → 1 signed proposal with GST invoice.",
      "After Day 90: You give 60-day notice with a client already paying — not before.",
    ],
    rateCard: [
      { tier: "Starter", price: "₹40k / project", for: "Your first 2 clients — case-study fuel" },
      { tier: "Standard", price: "₹1.2L / project", for: "Months 3–6 — repeatable scope" },
      { tier: "Premium", price: "₹3L+ / retainer", for: "Month 7+ — anchor client tier" },
    ],
    pitfall:
      "Quitting first, figuring out clients later. \"Sabbatical to start a consultancy\" without a single paying conversation = 9 months of cash burn and a return to corporate at lower compensation.",
    cta: "Apply for the next batch",
  },
  "side-hustler": {
    slug: "side-hustler",
    kicker: "Archetype 2 of 6",
    title: "The Side Hustler",
    oneLiner:
      "You already get paid for your side work. You just can't make it your full-time without panic.",
    meta: "For: salaried professionals already taking 1–3 paid projects on weekends.",
    voice:
      "\"I made ₹3.5L last year from weekend projects. If I just had more time… but I can't justify quitting until the side income matches the salary, and that's a chicken-and-egg loop.\"",
    signs: [
      "You have a tax-deducted-at-source receipt or two from your side work.",
      "You under-charge because the day job pays the bills.",
      "Your weekends are gone but your savings are growing.",
      "You haven't formalised — no Udyam, no GST, no separate bank account.",
    ],
    truth:
      "The reason your side income won't grow is because you treat it like a side. Formalise it (Udyam + separate account + invoice template) and the price doubles within 60 days.",
    ninetyDay: [
      "Week 1: Udyam registration. Separate current account. Invoice template with GST clauses.",
      "Weeks 2–4: Raise existing client prices by 40–60%. Most will say yes; one will leave (that's the point).",
      "Weeks 5–8: Two new clients at the new rate via your existing case studies.",
      "Weeks 9–12: Cut day-job hours by negotiating 4-day week OR plan a clean exit at 6-month mark.",
    ],
    rateCard: [
      { tier: "Starter (old you)", price: "₹15–25k / project", for: "Discount-driven friends-and-family rate" },
      { tier: "Standard (new you)", price: "₹50–75k / project", for: "Indian market median for your skill" },
      { tier: "Premium", price: "₹1.5L+ / retainer", for: "When the case studies start working" },
    ],
    pitfall:
      "Never raising prices because old clients \"won't pay it\". Of course they won't — you trained them not to. New clients at new prices is the whole game.",
    cta: "Apply for the next batch",
  },
  "returning-to-work": {
    slug: "returning-to-work",
    kicker: "Archetype 3 of 6",
    title: "The Return-to-Work Founder",
    oneLiner:
      "You took 3, 5, or 12 years off. You're brilliant and the market acts like you don't exist.",
    meta: "For: women returning from a career break — homemakers, caregivers, post-maternity, post-relocation.",
    voice:
      "\"I was the marketing head before I had Aarav. Now recruiters skip my CV in 4 seconds because of the gap. I'm tired of explaining the gap. I want to be paid for what I actually know.\"",
    signs: [
      "Your CV gap is 18 months or more.",
      "You've taken a paid online course or two to \"refresh\".",
      "You're considering re-entering the job market at 40% lower compensation than peers.",
      "You quietly know you're sharper than half your old colleagues.",
    ],
    truth:
      "The gap is your competitive advantage. Time off = a network of mothers / homemakers / community members who are your first 10 customers. Consulting doesn't ask for a clean CV. Consulting asks for a clean outcome.",
    ninetyDay: [
      "Weeks 1–4: Pick a niche where your pre-break expertise + your during-break network overlap (e.g., wellness for working mothers, nutrition for school canteens, finance literacy for housewives).",
      "Weeks 5–8: Workshop your origin story. \"I took a break, I came back stronger\" beats \"sorry for the gap\" every time.",
      "Weeks 9–12: 3 workshops or 3 1:1 paid sessions — proof you can deliver, not perform.",
      "By Day 90: First paying client + a public win that closes the gap conversation forever.",
    ],
    rateCard: [
      { tier: "Starter", price: "₹3–5k / session", for: "1:1 paid sessions to build trust + reviews" },
      { tier: "Standard", price: "₹15–35k / workshop", for: "Group programmes at schools, RWAs, corporate D&I" },
      { tier: "Premium", price: "₹75k+ / monthly retainer", for: "Corporate or institutional clients" },
    ],
    pitfall:
      "Trying to re-enter via job applications. You'll spend 6–9 months convincing recruiters you're worth less than you are. Consulting skips that whole conversation — clients pay for outcomes, not for tenure.",
    cta: "Apply for the Return-to-Work track (Bhavna-led)",
  },
  "rising-graduate": {
    slug: "rising-graduate",
    kicker: "Archetype 4 of 6",
    title: "The Rising Graduate",
    oneLiner:
      "You just finished college and you'd rather eat glass than spend the next 5 years in a cubicle.",
    meta: "For: 22–25 year-olds who don't want a corporate job — and shouldn't.",
    voice:
      "\"My friends got Deloitte / Wipro / Accenture offers. I have a portfolio of 6 freelance design projects and ₹40k in my account. My parents think I'm lost. I just don't want to be a cog at 22.\"",
    signs: [
      "You already do paid freelance work on Upwork / Fiverr / Instagram DMs.",
      "Your college placement cell calls you \"non-committal\".",
      "You explain to relatives 11 times what you do and still nobody gets it.",
      "You don't have 6 months of runway and your parents don't have a safety net for you.",
    ],
    truth:
      "Your two superpowers are time and tolerance for risk. Spend the first year stacking case studies and reputation, not chasing high prices. By 24 you can charge 3x what a 28-year-old salaried professional with the same skills earns.",
    ninetyDay: [
      "Weeks 1–4: Pick ONE niche (drop the 6-services menu). Build 3 spec projects + a public portfolio.",
      "Weeks 5–8: 50 cold DMs / week to founders in your niche. Aim for 10 reply, 3 calls, 1 paid trial.",
      "Weeks 9–12: First retainer client (₹15–30k/month). Repeat every 30 days until you have 4.",
      "Year 1 goal: ₹6–10L revenue. Year 2: ₹15–25L. Skip the corporate ladder entirely.",
    ],
    rateCard: [
      { tier: "Starter", price: "₹3–8k / one-off", for: "First 5 clients — portfolio bait" },
      { tier: "Standard", price: "₹15–30k / month retainer", for: "Month 4 onwards" },
      { tier: "Premium", price: "₹50k+ / month retainer", for: "Year 2 — when you have 6+ case studies" },
    ],
    pitfall:
      "Charging ₹500/hour for years because \"I'm just starting\". Underpricing at 22 trains the market to underpay you at 30. Charge for outcomes, not your age.",
    cta: "Apply for the next batch",
  },
  "first-gen-consultant": {
    slug: "first-gen-consultant",
    kicker: "Archetype 5 of 6",
    title: "The First-Gen Consultant",
    oneLiner:
      "You already work with clients. You don't have a system. Cash flow is anxiety.",
    meta: "For: independent consultants 1–3 years in, ₹4–15L revenue, no formal business backbone.",
    voice:
      "\"I made ₹8L last year. I love the work. I have no idea what next month looks like. I haven't filed GST properly. I'm scared to raise prices. I'm scared to take a vacation.\"",
    signs: [
      "You have 2–5 clients and one of them is 60% of your revenue.",
      "You quote inconsistently — same scope, different prices, no logic.",
      "You haven't taken more than 4 days off in a year.",
      "Your CA hasn't been replaced even though they confuse you every quarter.",
    ],
    truth:
      "You're not under-skilled. You're under-systemised. The fix is boring: niche statement, rate card, proposal template, GST workflow, monthly review. The boring stuff is what doubles your revenue.",
    ninetyDay: [
      "Week 1: Audit last 12 months — revenue by client, hours per client, real hourly rate. Cry a little.",
      "Weeks 2–4: Niche statement. Rate card with anchor. Standard proposal template (no more custom-quoting from scratch).",
      "Weeks 5–8: Fire the lowest-paying client. Raise rates 50% on the rest. Replace fired client at the new rate.",
      "Weeks 9–12: Build the monthly business review ritual. CA conversation. Udyam + clean GST filings.",
    ],
    rateCard: [
      { tier: "Starter (legacy)", price: "₹25–40k / project", for: "Clients you grandfathered in" },
      { tier: "Standard (current)", price: "₹75k–1.5L / project", for: "Indian market for 2-year practitioner" },
      { tier: "Premium (anchor)", price: "₹2.5L+ / retainer", for: "Where you're heading — set price first, deliver later" },
    ],
    pitfall:
      "Being available 24×7 to every client because each one feels like the last one. Boundaries don't lose you clients — they get you better ones.",
    cta: "Apply for the next batch",
  },
  "tier2-dreamer": {
    slug: "tier2-dreamer",
    kicker: "Archetype 6 of 6",
    title: "The Tier-2 Dreamer",
    oneLiner:
      "You're in Jaipur, Indore, Kanpur, Kochi, Bhubaneswar. You don't want to move. You shouldn't have to.",
    meta: "For: founders in tier-2 / tier-3 Indian cities who refuse to relocate to Bangalore.",
    voice:
      "\"Everyone says move to Bangalore for clients. My family is here. My costs are 60% lower. Why should I move? But every consultant Twitter says you need the Bangalore network. Am I being naive?\"",
    signs: [
      "You're in a city under 4M people.",
      "Your living cost is ₹25–40k/month max.",
      "You have a local network of MSMEs that nobody in Bangalore is serving.",
      "You're tempted to relocate \"for opportunity\" against your gut.",
    ],
    truth:
      "Two real opportunities: (1) Serve local MSMEs (40% margin, low competition, sticky retention). (2) Serve metro clients remotely at metro prices while living on tier-2 costs. Both beat moving to Bangalore.",
    ninetyDay: [
      "Weeks 1–4: Decide — local MSME niche OR remote metro niche. Don't split.",
      "Weeks 5–8: If local — walk into 30 businesses with a printed one-pager. If remote — LinkedIn-first plan, video discovery calls.",
      "Weeks 9–12: First 2 clients. Either ₹25k/month local OR ₹75k+/month metro.",
      "Year 1: Don't move. Year 2: Don't move. Year 3: Decide based on data, not FOMO.",
    ],
    rateCard: [
      { tier: "Local MSME", price: "₹15–35k / month retainer", for: "Sticky, low-touch, high-margin" },
      { tier: "Metro remote", price: "₹50k–1.5L / project", for: "Same prices as metro consultants, lower costs" },
      { tier: "Hybrid premium", price: "₹2L+ / retainer", for: "Year 2 — combining both" },
    ],
    pitfall:
      "Moving to Bangalore at month 6 because of FOMO and burning the runway you'd built in your home city. Your tier-2 cost advantage IS your competitive moat — don't dissolve it.",
    cta: "Apply for the next batch",
  },
};

export const Route = createFileRoute("/tracks/$slug")({
  loader: ({ params }) => {
    const track = TRACKS[params.slug];
    if (!track) throw notFound();
    return { track };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.track.title} — UGrowth Consultancy` },
      { name: "description", content: loaderData?.track.oneLiner ?? "" },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const { track } = Route.useLoaderData();
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-xs text-muted-foreground hover:text-primary">
          ← All archetypes
        </Link>
        <p className="mt-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
          {track.kicker}
        </p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          {track.title}
        </h1>
        <p className="mt-5 text-lg text-foreground leading-relaxed">{track.oneLiner}</p>
        <p className="mt-2 text-sm text-muted-foreground">{track.meta}</p>

        {/* Voice quote */}
        <blockquote className="mt-10 border-l-4 border-accent bg-card p-5 italic text-foreground">
          {track.voice}
        </blockquote>

        {/* Signs */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-primary">Signs this is you</h2>
          <ul className="mt-4 space-y-2 text-[15px] text-foreground list-disc list-inside marker:text-accent">
            {track.signs.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>

        {/* The truth */}
        <div className="mt-12 rounded-2xl bg-primary text-primary-foreground p-6 md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            The honest truth
          </p>
          <p className="mt-3 text-lg leading-relaxed">{track.truth}</p>
        </div>

        {/* 90-day plan */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-primary">Your 90-day plan</h2>
          <ol className="mt-4 space-y-3">
            {track.ninetyDay.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                  {i + 1}
                </span>
                <span className="text-[15px] text-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Rate card */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-primary">Your three-tier rate card</h2>
          <div className="mt-4 grid gap-3">
            {track.rateCard.map((r) => (
              <div
                key={r.tier}
                className="rounded-xl border border-border bg-card p-5 md:flex md:items-center md:gap-6"
              >
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent md:w-32">
                  {r.tier}
                </p>
                <p className="mt-2 md:mt-0 font-display text-lg text-primary md:w-48">
                  {r.price}
                </p>
                <p className="mt-1 md:mt-0 text-sm text-foreground flex-1">{r.for}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pitfall */}
        <div className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-destructive">
            The biggest pitfall
          </p>
          <p className="mt-2 text-[15px] text-foreground leading-relaxed">{track.pitfall}</p>
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl bg-card border-2 border-accent p-8 text-center">
          <h3 className="font-display text-2xl text-primary">Ready to do this?</h3>
          <p className="mt-3 text-sm text-foreground max-w-md mx-auto">
            The 12-week batch takes you through the full 90-day plan with Captain on every
            session.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/apply"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              {track.cta} →
            </Link>
            <Link
              to="/ai-advisor"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Ask the AI Advisor first
            </Link>
          </div>
          <div className="mt-4">
            <WhatsAppButton
              context={`track_${track.slug}_cta`}
              message={`Hi, I'm a ${track.title}. Want to know more about the batch.`}
              label="Or WhatsApp Captain"
              variant="ghost"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
