import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import jsPDF from "jspdf";
import { Sparkles, Check, Download, Mail, Share2, Star } from "lucide-react";

import { WizardShell } from "@/components/tools/WizardShell";
import { EmailGate } from "@/components/tools/EmailGate";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/track";
import { INDIAN_CITIES } from "@/lib/cities";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tools/rate-card-builder")({
  head: () => ({
    meta: [
      {
        title:
          "Free Rate Card Builder — What Should Indian Consultants Charge? | UGrowth Consultancy",
      },
      {
        name: "description",
        content:
          "Get a 3-tier rate card tailored to your service, city, experience, and client type. Free, in ₹, ready to share with clients.",
      },
      {
        property: "og:title",
        content: "Free Rate Card Builder for Indian Consultants",
      },
      {
        property: "og:description",
        content:
          "A 3-tier rate card in ₹, tailored to your city and experience.",
      },
      { property: "og:url", content: "/tools/rate-card-builder" },
    ],
    links: [{ rel: "canonical", href: "/tools/rate-card-builder" }],
  }),
  component: RateCardBuilderPage,
});

const SERVICES = [
  "Consulting",
  "Coaching",
  "Design",
  "Development",
  "Writing",
  "Marketing",
  "Legal",
  "Accounting",
  "Training",
  "Other",
] as const;

type ServiceType = (typeof SERVICES)[number];
type ClientType = "Individuals" | "Small business" | "Mid-size company" | "Enterprise";
type PaymentStyle = "Per hour" | "Per project" | "Per month retainer" | "Mix";

type Answers = {
  service: ServiceType | "";
  customService: string;
  city: string;
  years: number;
  client: ClientType | "";
  pay: PaymentStyle | "";
};

const initial: Answers = {
  service: "",
  customService: "",
  city: "",
  years: 3,
  client: "",
  pay: "",
};

const FAQ = [
  {
    q: "How are these numbers calculated?",
    a: "We use a base hourly rate per service and adjust for your city tier, years of experience, and client size. The numbers are starting points — feel free to nudge them based on your portfolio strength.",
  },
  {
    q: "Why three tiers?",
    a: "Three tiers anchor your pricing. The premium tier makes the standard tier look reasonable — most clients pick the middle one, which is by design.",
  },
  {
    q: "Are these prices in ₹ inclusive of GST?",
    a: "No, prices are pre-GST. Add 18% GST on top once you cross the ₹20 lakh turnover threshold (₹10 lakh in special-category states).",
  },
];

const SERVICE_BASE: Record<ServiceType, number> = {
  Consulting: 1500,
  Coaching: 2000,
  Design: 1200,
  Development: 1500,
  Writing: 800,
  Marketing: 1200,
  Legal: 2000,
  Accounting: 1000,
  Training: 1500,
  Other: 1000,
};

const TIER1 = new Set(["Mumbai", "Delhi", "Bengaluru", "Bangalore", "Gurgaon", "Noida"]);
const TIER2 = new Set([
  "Pune", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Chandigarh", "Kochi",
  "Thiruvananthapuram",
]);

function cityMultiplier(city: string) {
  if (TIER1.has(city)) return 1.5;
  if (TIER2.has(city)) return 1.2;
  return 1.0;
}
function expMultiplier(years: number) {
  if (years <= 2) return 0.6;
  if (years <= 5) return 1.0;
  if (years <= 10) return 1.5;
  return 2.2;
}
function clientMultiplier(c: ClientType) {
  return c === "Individuals" ? 1.0 : c === "Small business" ? 1.2 : c === "Mid-size company" ? 2.0 : 3.5;
}

function roundNice(n: number) {
  if (n < 1000) return Math.max(100, Math.round(n / 100) * 100);
  if (n < 10000) return Math.round(n / 500) * 500;
  if (n < 100000) return Math.round(n / 1000) * 1000;
  return Math.round(n / 5000) * 5000;
}

function fmtINR(n: number) {
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

const DELIVERABLES: Record<ServiceType, string[]> = {
  Consulting: ["1-hour strategy call", "Email follow-up", "Written action plan"],
  Coaching: ["Weekly 1:1 session", "Async voice notes", "Progress check-in"],
  Design: ["Design brief review", "2 rounds of revisions", "Source files + handoff"],
  Development: ["Scoping & estimate", "Working build", "Bug fixes for 14 days"],
  Writing: ["Brief intake", "First draft", "1 round of revisions"],
  Marketing: ["Channel audit", "Campaign plan", "Weekly review call"],
  Legal: ["Document review", "1 consultation call", "Marked-up draft"],
  Accounting: ["Books cleanup", "Monthly reporting", "Year-end summary"],
  Training: ["Curriculum outline", "Live session(s)", "Worksheets & recording"],
  Other: ["Discovery call", "Defined deliverable", "1 round of revisions"],
};

function compute(a: Answers) {
  const svc = (a.service || "Other") as ServiceType;
  const base = SERVICE_BASE[svc];
  const H =
    base *
    cityMultiplier(a.city) *
    expMultiplier(a.years) *
    clientMultiplier((a.client || "Individuals") as ClientType);
  const make = (m: number) => ({
    hour: roundNice(H * m),
    project: roundNice(H * m * 4),
    month: roundNice(H * m * 30),
  });
  return {
    starter: make(1),
    standard: make(2),
    premium: make(5),
    H,
  };
}

function RateCardBuilderPage() {
  const [step, setStep] = React.useState(1);
  const [a, setA] = React.useState<Answers>(initial);
  const [outputs, setOutputs] = React.useState<ReturnType<typeof compute> | null>(null);
  const [showEmail, setShowEmail] = React.useState(false);
  const [emailCaptured, setEmailCaptured] = React.useState<string | null>(null);
  const [shareCopied, setShareCopied] = React.useState(false);

  React.useEffect(() => {
    track("tool_started", { tool: "rate_card_builder" });
  }, []);

  const canContinue = (() => {
    if (step === 1)
      return !!a.service && (a.service !== "Other" || a.customService.trim().length >= 2);
    if (step === 2) return !!a.city;
    if (step === 3) return a.years >= 0;
    if (step === 4) return !!a.client;
    if (step === 5) return !!a.pay;
    return true;
  })();

  function handleContinue() {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }
    const o = compute(a);
    setOutputs(o);
    track("tool_completed", { tool: "rate_card_builder" });
    setShowEmail(true);
  }

  async function handleEmail(email: string) {
    const payloadIn = {
      ...a,
      service: a.service === "Other" ? `Other: ${a.customService}` : a.service,
    };
    await supabase.from("tools_outputs").insert({
      tool_name: "rate_card_builder",
      input_data: payloadIn as never,
      output_data: outputs as never,
      email,
    });
    setEmailCaptured(email);
    track("email_captured", { tool: "rate_card_builder" });
    setShowEmail(false);
  }

  function handleSavePdf() {
    if (!outputs) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const w = doc.internal.pageSize.getWidth();
    let y = margin;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Your Rate Card", margin, y);
    y += 20;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(
      `${a.service === "Other" ? a.customService : a.service} · ${a.city} · ${a.years}+ yrs · ${a.client}`,
      margin,
      y,
    );
    doc.setTextColor(0);
    y += 24;
    const tiers = [
      { name: "Starter", ...outputs.starter },
      { name: "Standard (most chosen)", ...outputs.standard },
      { name: "Premium", ...outputs.premium },
    ];
    tiers.forEach((t) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(t.name, margin, y);
      y += 16;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Per hour: ${fmtINR(t.hour)}`, margin, y);
      y += 14;
      doc.text(`Per project: ${fmtINR(t.project)}`, margin, y);
      y += 14;
      doc.text(`Per month retainer: ${fmtINR(t.month)}`, margin, y);
      y += 20;
    });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.setTextColor(110);
    const wh = doc.splitTextToSize(
      "Why this works: the Premium tier anchors your pricing — it makes Standard look like the reasonable choice. Most clients pick Standard, which is by design.",
      w - margin * 2,
    );
    wh.forEach((ln: string) => {
      doc.text(ln, margin, y);
      y += 12;
    });
    doc.save(`ugrowth-rate-card-${Date.now()}.pdf`);
  }

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard?.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
    track("share_clicked", { tool: "rate_card_builder" });
  }

  // ---------- output ----------
  if (outputs) {
    const svc = (a.service === "Other" ? "Other" : a.service || "Other") as ServiceType;
    const deliverables = DELIVERABLES[svc];
    const tiers = [
      { id: "starter", name: "Starter", prices: outputs.starter, highlight: false },
      { id: "standard", name: "Standard", prices: outputs.standard, highlight: true },
      { id: "premium", name: "Premium", prices: outputs.premium, highlight: false },
    ];
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <section className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-primary md:text-4xl">
              Your three-tier rate card
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              {a.service === "Other" ? a.customService : a.service} · {a.city} · {a.years}+ years · {a.client}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {tiers.map((t) => (
              <article
                key={t.id}
                className={cn(
                  "relative rounded-2xl border bg-card p-5 shadow-sm",
                  t.highlight
                    ? "border-accent shadow-md ring-1 ring-accent/40"
                    : "border-border",
                )}
              >
                {t.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">
                    <Star className="mr-1 inline h-3 w-3" /> Most clients choose this
                  </span>
                )}
                <h2 className="font-display text-xl font-semibold text-primary">
                  {t.name}
                </h2>
                <div className="mt-4 space-y-2">
                  <PriceRow label="Per hour" v={t.prices.hour} />
                  <PriceRow label="Per project" v={t.prices.project} />
                  <PriceRow label="Per month retainer" v={t.prices.month} />
                </div>
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Includes
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-3.5 w-3.5 text-accent" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-2xl rounded-xl bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            <strong className="text-foreground">Why this pricing works:</strong>{" "}
            the Premium tier anchors your pricing. It makes the Standard tier
            feel like the reasonable choice — and most clients pick the middle.
            That's the Anchoring Principle, working for you.
          </p>

          {emailCaptured && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <p className="text-sm">
                <Check className="mr-1 inline h-4 w-4 text-accent" />
                Saved. We'll email this rate card to{" "}
                <span className="font-medium">{emailCaptured}</span>.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleSavePdf}>
                  <Download className="mr-2 h-4 w-4" /> Save as PDF
                </Button>
                <Button variant="outline" onClick={() => setShowEmail(true)}>
                  <Mail className="mr-2 h-4 w-4" /> Send to a different email
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  {shareCopied ? "Link copied" : "Share with a friend"}
                </Button>
              </div>
            </div>
          )}

          <Link
            to="/workshops"
            onClick={() =>
              track("soft_cta_clicked", { tool: "rate_card_builder", target: "workshops" })
            }
            className="mt-8 block rounded-xl border border-accent/30 bg-accent/5 p-5 hover:border-accent"
          >
            <p className="text-sm font-medium text-primary">
              Want help defending these prices in client conversations?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Captain's Pricing Mastery Workshop. Reserve a spot →
            </p>
          </Link>
        </section>

        <ToolFAQ items={FAQ} />

        <EmailGate
          open={showEmail}
          onOpenChange={setShowEmail}
          title="Your rate card is ready"
          description="Where should we send it?"
          onSubmit={handleEmail}
        />
      </div>
    );
  }

  // ---------- wizard ----------
  return (
    <WizardShell
      step={step}
      total={5}
      title={STEP_TITLES[step - 1]}
      canContinue={canContinue}
      onBack={step > 1 ? () => setStep((s) => s - 1) : undefined}
      onContinue={handleContinue}
      continueLabel={step === 5 ? "Build my rate card" : "Continue"}
    >
      {step === 1 && (
        <div className="space-y-3">
          <Label>Service</Label>
          <Select
            value={a.service}
            onValueChange={(v) => setA({ ...a, service: v as ServiceType })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Pick a service" />
            </SelectTrigger>
            <SelectContent>
              {SERVICES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {a.service === "Other" && (
            <Input
              value={a.customService}
              onChange={(e) => setA({ ...a, customService: e.target.value })}
              placeholder="Describe your service"
              maxLength={80}
            />
          )}
        </div>
      )}
      {step === 2 && (
        <div>
          <Label>City</Label>
          <Select value={a.city} onValueChange={(v) => setA({ ...a, city: v })}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Pick your city" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {INDIAN_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="mt-2 text-xs text-muted-foreground">
            Tier-1 cities command higher rates; we adjust for this automatically.
          </p>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-3">
          <Label>Years of experience: {a.years}{a.years >= 25 ? "+" : ""}</Label>
          <Slider
            min={0}
            max={25}
            step={1}
            value={[a.years]}
            onValueChange={(v) => setA({ ...a, years: v[0] })}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Beginner</span>
            <span>Senior</span>
          </div>
        </div>
      )}
      {step === 4 && (
        <RadioGroup
          value={a.client}
          onValueChange={(v) => setA({ ...a, client: v as ClientType })}
          className="space-y-2"
        >
          {(["Individuals", "Small business", "Mid-size company", "Enterprise"] as ClientType[]).map(
            (c) => (
              <label
                key={c}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-accent"
              >
                <RadioGroupItem value={c} />
                <span className="text-sm">{c}</span>
              </label>
            ),
          )}
        </RadioGroup>
      )}
      {step === 5 && (
        <RadioGroup
          value={a.pay}
          onValueChange={(v) => setA({ ...a, pay: v as PaymentStyle })}
          className="space-y-2"
        >
          {(["Per hour", "Per project", "Per month retainer", "Mix"] as PaymentStyle[]).map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-accent"
            >
              <RadioGroupItem value={c} />
              <span className="text-sm">{c}</span>
            </label>
          ))}
        </RadioGroup>
      )}
    </WizardShell>
  );
}

function PriceRow({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-dashed border-border/60 pb-1.5 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-display text-lg font-semibold text-primary">
        {fmtINR(v)}
      </span>
    </div>
  );
}

const STEP_TITLES = [
  "What service do you provide?",
  "Which city are you in?",
  "How many years of experience in this area?",
  "Who's your typical client?",
  "How do you want to be paid?",
];
