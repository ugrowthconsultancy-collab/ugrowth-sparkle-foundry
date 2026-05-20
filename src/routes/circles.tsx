import { createFileRoute, Link } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/circles")({
  head: () => ({
    meta: [
      { title: "Founder Peer Circles — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Don't do this alone. Join a curated peer circle of 10 Indian founders in your city — weekly Zoom + monthly chai meetup. ₹500/month, refundable.",
      },
    ],
  }),
  component: CirclesPage,
});

const CITIES = [
  { name: "Mumbai", status: "active", spots: 2 },
  { name: "Delhi NCR", status: "active", spots: 4 },
  { name: "Bangalore", status: "active", spots: 1 },
  { name: "Pune", status: "forming", spots: 7 },
  { name: "Hyderabad", status: "forming", spots: 5 },
  { name: "Chennai", status: "forming", spots: 6 },
  { name: "Ahmedabad", status: "waitlist", spots: 0 },
  { name: "Kolkata", status: "waitlist", spots: 0 },
  { name: "Jaipur", status: "waitlist", spots: 0 },
  { name: "Kochi", status: "waitlist", spots: 0 },
  { name: "Chandigarh", status: "waitlist", spots: 0 },
  { name: "Indore", status: "waitlist", spots: 0 },
];

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  active: { text: "Running now", cls: "bg-accent/10 text-accent border-accent/30" },
  forming: { text: "Forming next batch", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  waitlist: { text: "Waitlist", cls: "bg-muted text-muted-foreground border-border" },
};

function CirclesPage() {
  return (
    <section className="flex-1 px-4 py-12 md:py-20 bg-background">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
          Founder Peer Circles
        </p>
        <h1 className="mt-3 font-display text-3xl md:text-5xl font-semibold text-primary leading-tight">
          Don't do this alone.
        </h1>
        <p className="mt-5 text-lg text-foreground max-w-2xl leading-relaxed">
          A curated circle of <strong>10 Indian founders</strong> in your city, matched by
          stage and intent. Weekly 60-minute Zoom hot-seat plus a monthly in-person chai
          meetup. Captain-moderated for the first 4 weeks, then self-run.
        </p>

        {/* How it works */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "We match you",
              body: "Tell us your city, archetype, and where you're stuck. We place you in a circle with 9 founders at a similar stage.",
            },
            {
              n: "2",
              title: "You show up weekly",
              body: "60-minute Zoom every Saturday morning. Three founders get the hot seat each week — wins, blocks, asks. Real accountability.",
            },
            {
              n: "3",
              title: "Chai once a month",
              body: "In-person meetup in your city. No agenda, just chai and honest conversation. The relationships outlive the circle.",
            },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-semibold">
                {s.n}
              </div>
              <h3 className="mt-4 font-display text-lg text-primary">{s.title}</h3>
              <p className="mt-2 text-sm text-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-12 rounded-2xl border-2 border-accent bg-card p-6 md:p-10">
          <div className="md:flex md:items-center md:justify-between gap-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                What it costs
              </p>
              <h2 className="mt-2 font-display text-3xl text-primary">₹500/month</h2>
              <p className="mt-3 text-foreground leading-relaxed">
                Covers the chai meetup, Zoom, and the matching effort. Pay monthly via UPI —
                cancel any time. <strong>Cohort alumni get the first 3 months free.</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Refundable if you don't gel with your circle in the first 4 weeks.
              </p>
            </div>
            <div className="mt-6 md:mt-0 flex flex-col gap-2 md:items-end">
              <WhatsAppButton
                context="circles_join"
                message="Hi, I want to join a Founder Peer Circle. My city is ___ and I describe myself as a [archetype]."
                label="Request a circle via WhatsApp"
                variant="inline"
              />
              <Link
                to="/cohort"
                className="text-xs text-muted-foreground hover:text-primary underline"
              >
                Already a batch alum? Mention it.
              </Link>
            </div>
          </div>
        </div>

        {/* City list */}
        <div className="mt-12">
          <h2 className="font-display text-2xl text-primary">Circles by city</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            12 cities live or forming. Don't see yours? Tell us — we form a new circle once 6
            founders ask for it.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {CITIES.map((c) => {
              const s = STATUS_LABEL[c.status];
              return (
                <div
                  key={c.name}
                  className="rounded-xl border border-border bg-card p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-primary">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.spots > 0 ? `${c.spots} spots left` : "Join waitlist"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wide uppercase rounded-full border px-2 py-0.5 ${s.cls}`}
                  >
                    {s.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-display text-2xl text-primary">FAQ</h2>
          <div className="mt-6 space-y-5">
            <div>
              <h3 className="font-medium text-primary">Who's in a typical circle?</h3>
              <p className="mt-1 text-sm text-foreground">
                Mix of archetypes by design — a salaried engineer, two homemakers returning to
                work, a first-gen consultant, a tier-2 founder, etc. The cross-pollination is
                the point.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">Is Captain in the circle?</h3>
              <p className="mt-1 text-sm text-foreground">
                Captain moderates the first 4 weeks to set the norms (the "hot seat" format,
                no advice-giving, no selling). After that you self-run. Captain joins the
                monthly chai meetup whenever he's in your city.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">What if I miss sessions?</h3>
              <p className="mt-1 text-sm text-foreground">
                Miss 3 in a row and we ask you to step out so a waitlist founder can take your
                seat. Circles only work when people show up.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-primary">Can I bring my own circle?</h3>
              <p className="mt-1 text-sm text-foreground">
                Yes — if you have 6+ founders already, message us on WhatsApp. We onboard you
                as a self-formed circle for ₹300/month/person (no matching fee).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <WhatsAppButton
            context="circles_footer"
            message="Hi, I'd like to know more about Founder Peer Circles."
            label="Talk to us about circles"
            variant="inline"
          />
        </div>
      </div>
    </section>
  );
}
