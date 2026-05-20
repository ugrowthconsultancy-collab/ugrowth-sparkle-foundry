import * as React from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { track } from "@/lib/track";

const KNOWN = [
  "gst-checker",
  "working-capital",
  "vital-signs",
  "compliance-calendar",
] as const;
type ToolSlug = (typeof KNOWN)[number];

// Note: /tools/niche-generator and /tools/rate-card-builder have their own
// dedicated route files (tools.niche-generator.tsx, tools.rate-card-builder.tsx)
// which take precedence over this dynamic param route. This catch-all handles
// the 4 secondary tools above + 404s any unknown slug.

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    if (!KNOWN.includes(params.slug as ToolSlug)) throw notFound();
    return { slug: params.slug as ToolSlug };
  },
  head: ({ loaderData }) => {
    const META: Record<ToolSlug, { title: string; desc: string }> = {
      "gst-checker": {
        title: "GST Eligibility Checker — Free | UGrowth Consultancy",
        desc: "Do you actually need GST registration? 5-question test. Indian thresholds, service vs goods, inter-state, e-commerce. Free, instant.",
      },
      "working-capital": {
        title: "Working Capital Calculator — Free | UGrowth Consultancy",
        desc: "How much money are your clients sitting on right now? Free calculator built for Indian B2B founders.",
      },
      "vital-signs": {
        title: "Founder Vital Signs — Free | UGrowth Consultancy",
        desc: "10 questions. Score 0–100. See exactly where your practice is fragile. Free, takes 3 minutes.",
      },
      "compliance-calendar": {
        title: "Compliance Calendar — Free | UGrowth Consultancy",
        desc: "Personalised 12-month deadline list for GST, TDS, ROC and EPF — based on your business type and turnover.",
      },
    };
    const m = loaderData ? META[loaderData.slug] : null;
    return {
      meta: [
        { title: m?.title ?? "Free Tool — UGrowth Consultancy" },
        { name: "description", content: m?.desc ?? "" },
      ],
    };
  },
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useLoaderData();
  return (
    <section className="flex-1 px-4 py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-2xl">
        <Link to="/resources" className="text-xs text-muted-foreground hover:text-primary">
          ← All resources
        </Link>
        {slug === "gst-checker" && <GstChecker />}
        {slug === "working-capital" && <WorkingCapital />}
        {slug === "vital-signs" && <VitalSigns />}
        {slug === "compliance-calendar" && <ComplianceCalendar />}
      </div>
    </section>
  );
}

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

/* ------------------------------------------------------------------ */
/* GST Eligibility Checker                                            */
/* ------------------------------------------------------------------ */

function GstChecker() {
  const [businessType, setBusinessType] = React.useState<"services" | "goods" | "both">(
    "services",
  );
  const [turnover, setTurnover] = React.useState("");
  const [interstate, setInterstate] = React.useState<"yes" | "no">("no");
  const [ecommerce, setEcommerce] = React.useState<"yes" | "no">("no");
  const [exports, setExports] = React.useState<"yes" | "no">("no");
  const [verdict, setVerdict] = React.useState<{
    required: boolean;
    reason: string;
    threshold: string;
  } | null>(null);

  React.useEffect(() => {
    track("tool_view", { tool: "gst-checker" });
  }, []);

  function check(e: React.FormEvent) {
    e.preventDefault();
    const t = parseInt(turnover.replace(/[^0-9]/g, ""), 10) || 0;
    // Service threshold ₹20L (₹10L in special states); Goods ₹40L (₹20L in special states).
    // For tier-1 simplification we use ₹20L (services) / ₹40L (goods).
    const threshold =
      businessType === "goods" ? 40 : 20; // lakhs
    let required = false;
    let reason = "";

    if (exports === "yes") {
      required = true;
      reason =
        "You export services or goods. Even ₹1 of export turnover requires GST registration (LUT route gives you zero-rated sales, but registration is mandatory).";
    } else if (ecommerce === "yes") {
      required = true;
      reason =
        "You sell through an e-commerce operator (Amazon, Flipkart, Swiggy, Zomato, etc.). GST registration is compulsory regardless of turnover.";
    } else if (interstate === "yes" && businessType !== "services") {
      required = true;
      reason =
        "You sell goods across state lines. GST is mandatory for inter-state supply of goods regardless of turnover (services have an exception until ₹20L).";
    } else if (t >= threshold) {
      required = true;
      reason = `Your annual turnover (₹${t}L) is at or above the ₹${threshold}L threshold for ${businessType === "goods" ? "goods" : "services"}.`;
    } else {
      required = false;
      reason = `Your turnover (₹${t}L) is below the ₹${threshold}L threshold and none of the special triggers apply. GST is optional. Many founders register voluntarily to claim input tax credit and look credible to B2B clients — your call.`;
    }

    setVerdict({
      required,
      reason,
      threshold: `${threshold}L`,
    });
    track("tool_complete", { tool: "gst-checker", required });
  }

  return (
    <>
      <p className="mt-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
        Free tool
      </p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-primary leading-tight">
        GST Eligibility Checker
      </h1>
      <p className="mt-4 text-base text-foreground leading-relaxed">
        Do you actually need GST registration? Answer 5 questions. Get a verdict based on the
        current CGST Act thresholds and the inter-state, e-commerce, and export carve-outs.
      </p>

      <form onSubmit={check} className="mt-10 space-y-5">
        <div>
          <Label>1. What do you sell?</Label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value as typeof businessType)}
            className="mt-1.5 w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="services">Services only (consulting, agency, freelance work)</option>
            <option value="goods">Goods only (products, manufactured items)</option>
            <option value="both">Both goods and services</option>
          </select>
        </div>
        <div>
          <Label htmlFor="turnover">2. Annual turnover (₹ lakhs)</Label>
          <Input
            id="turnover"
            inputMode="numeric"
            placeholder="e.g., 15"
            value={turnover}
            onChange={(e) => setTurnover(e.target.value)}
            className="mt-1.5"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">Total invoiced last 12 months.</p>
        </div>
        <div>
          <Label>3. Do you sell across state borders?</Label>
          <select
            value={interstate}
            onChange={(e) => setInterstate(e.target.value as "yes" | "no")}
            className="mt-1.5 w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="no">No — all clients in my state</option>
            <option value="yes">Yes — clients in other Indian states</option>
          </select>
        </div>
        <div>
          <Label>4. Do you sell through Amazon, Flipkart, Swiggy, Zomato, or any e-commerce operator?</Label>
          <select
            value={ecommerce}
            onChange={(e) => setEcommerce(e.target.value as "yes" | "no")}
            className="mt-1.5 w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div>
          <Label>5. Do you have any export turnover (clients abroad)?</Label>
          <select
            value={exports}
            onChange={(e) => setExports(e.target.value as "yes" | "no")}
            className="mt-1.5 w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="no">No — only Indian clients</option>
            <option value="yes">Yes — at least one client outside India</option>
          </select>
        </div>
        <Button type="submit" size="lg">
          Check my GST status
        </Button>
      </form>

      {verdict && (
        <div
          className={`mt-10 rounded-2xl border-2 p-6 md:p-8 ${
            verdict.required
              ? "border-accent bg-accent/5"
              : "border-border bg-card"
          }`}
        >
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Verdict
          </p>
          <h2 className="mt-2 font-display text-2xl text-primary">
            {verdict.required ? "Yes — GST registration is required." : "No — GST is optional for you right now."}
          </h2>
          <p className="mt-3 text-sm text-foreground leading-relaxed">{verdict.reason}</p>
          <p className="mt-4 text-xs text-muted-foreground">
            Reference threshold used: ₹{verdict.threshold} annual turnover (services use ₹20L /
            goods use ₹40L in regular states; ₹10L / ₹20L in special-category states like the
            North-East and J&K).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {verdict.required && (
              <Link
                to="/services/$slug"
                params={{ slug: "gst-registration" }}
                className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                Get GST registration done — ₹1,999 →
              </Link>
            )}
            <Link
              to="/ai-advisor"
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Ask the AI for your specific case
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            This is a fast diagnostic, not legal advice. Composition scheme, RCM on imports, and
            state-specific rules can change the answer — always confirm with a CA before filing.
          </p>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Working Capital Calculator                                         */
/* ------------------------------------------------------------------ */

function WorkingCapital() {
  const [clients, setClients] = React.useState("");
  const [avgInvoice, setAvgInvoice] = React.useState("");
  const [paymentDays, setPaymentDays] = React.useState("45");
  const [monthlyExpenses, setMonthlyExpenses] = React.useState("");
  const [out, setOut] = React.useState<null | {
    ar: number;
    months: number;
    risk: "low" | "medium" | "high";
    note: string;
  }>(null);

  React.useEffect(() => {
    track("tool_view", { tool: "working-capital" });
  }, []);

  function calc(e: React.FormEvent) {
    e.preventDefault();
    const c = parseInt(clients.replace(/[^0-9]/g, ""), 10) || 0;
    const ai = parseInt(avgInvoice.replace(/[^0-9]/g, ""), 10) || 0;
    const d = parseInt(paymentDays.replace(/[^0-9]/g, ""), 10) || 0;
    const m = parseInt(monthlyExpenses.replace(/[^0-9]/g, ""), 10) || 0;

    // AR = clients × avg invoice × (payment days / 30)
    const ar = c * ai * (d / 30);
    const months = m > 0 ? ar / m : 0;

    let risk: "low" | "medium" | "high" = "low";
    let note = "";
    if (months >= 3) {
      risk = "high";
      note = `You have over ${months.toFixed(1)} months of expenses tied up in client receivables. This is the #1 reason Indian solo practices run out of cash. Shorten payment terms to NET 15, or use a milestone billing structure (50% upfront).`;
    } else if (months >= 1.5) {
      risk = "medium";
      note = `${months.toFixed(1)} months of expenses tied up is manageable but tight. Add late-fee clauses (1.5%/month after due date) to your invoices and stop renewing clients who consistently pay late.`;
    } else if (m > 0) {
      risk = "low";
      note = `Healthy — under ${months.toFixed(1)} months of expenses in receivables. Your terms or your clients (or both) are working in your favour.`;
    } else {
      note = "Add your monthly expenses to see how many months of cash are tied up.";
    }
    setOut({ ar, months, risk, note });
    track("tool_complete", { tool: "working-capital", risk });
  }

  return (
    <>
      <p className="mt-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
        Free tool
      </p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-primary leading-tight">
        Working Capital Calculator
      </h1>
      <p className="mt-4 text-base text-foreground leading-relaxed">
        Indian B2B payments are slow. The average corporate pays in 45–75 days. This tool tells
        you exactly how much money your clients are sitting on right now — and whether you have
        a quiet cash-flow problem.
      </p>

      <form onSubmit={calc} className="mt-10 space-y-5">
        <div>
          <Label htmlFor="clients">Active paying clients</Label>
          <Input
            id="clients"
            inputMode="numeric"
            placeholder="e.g., 4"
            value={clients}
            onChange={(e) => setClients(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="avgInvoice">Average monthly invoice per client (₹)</Label>
          <Input
            id="avgInvoice"
            inputMode="numeric"
            placeholder="e.g., 60000"
            value={avgInvoice}
            onChange={(e) => setAvgInvoice(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="paymentDays">
            Average days to get paid after invoice
          </Label>
          <Input
            id="paymentDays"
            inputMode="numeric"
            placeholder="e.g., 45"
            value={paymentDays}
            onChange={(e) => setPaymentDays(e.target.value)}
            className="mt-1.5"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Indian B2B average: small business 30 days · mid-market 45 days · large corp / PSU 60–90 days.
          </p>
        </div>
        <div>
          <Label htmlFor="monthlyExpenses">Your monthly business + personal expenses (₹)</Label>
          <Input
            id="monthlyExpenses"
            inputMode="numeric"
            placeholder="e.g., 80000"
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(e.target.value)}
            className="mt-1.5"
            required
          />
        </div>
        <Button type="submit" size="lg">
          Calculate
        </Button>
      </form>

      {out && (
        <div className="mt-10 rounded-2xl border-2 border-accent bg-card p-6 md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Your numbers
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Money owed to you right now</p>
              <p className="mt-1 font-display text-2xl text-primary">{inr(out.ar)}</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">Months of expenses tied up</p>
              <p
                className={`mt-1 font-display text-2xl ${
                  out.risk === "high"
                    ? "text-destructive"
                    : out.risk === "medium"
                      ? "text-amber-700"
                      : "text-primary"
                }`}
              >
                {out.months.toFixed(1)}
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm text-foreground leading-relaxed">{out.note}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/ai-advisor"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Ask the AI how to fix this →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Founder Vital Signs                                                */
/* ------------------------------------------------------------------ */

const VITAL_QS: { q: string; weight: number }[] = [
  { q: "I have 3+ paying clients right now.", weight: 12 },
  { q: "No single client is more than 50% of my revenue.", weight: 12 },
  { q: "I have a written niche statement I can recite in one sentence.", weight: 10 },
  { q: "I have a three-tier rate card I quote from (not custom every time).", weight: 10 },
  { q: "I have a standard proposal template (not built from scratch each time).", weight: 8 },
  { q: "I file my GST / income tax on time, with a CA's help.", weight: 10 },
  { q: "I have at least 3 months of personal expenses in savings.", weight: 12 },
  { q: "I took at least 7 days of true holiday in the last 12 months.", weight: 8 },
  { q: "I have a referral or repeat client engine — not just cold outreach.", weight: 10 },
  { q: "I review my numbers (revenue, AR, expenses) at least monthly.", weight: 8 },
];

function VitalSigns() {
  const [answers, setAnswers] = React.useState<boolean[]>(Array(VITAL_QS.length).fill(false));
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    track("tool_view", { tool: "vital-signs" });
  }, []);

  const score = answers.reduce((s, a, i) => (a ? s + VITAL_QS[i].weight : s), 0);

  let band: { label: string; tone: string; advice: string };
  if (score >= 80) {
    band = {
      label: "Healthy",
      tone: "text-accent",
      advice:
        "You have a real practice, not a job in disguise. Focus on raising prices, building a small team, and protecting your time. Your blind spot is usually saying no often enough.",
    };
  } else if (score >= 55) {
    band = {
      label: "Stable but exposed",
      tone: "text-amber-700",
      advice:
        "The fundamentals are there. The fragility is concentration — usually one client too big, or no system for the boring stuff. Fix client concentration and your monthly review ritual in the next 30 days.",
    };
  } else if (score >= 30) {
    band = {
      label: "Fragile",
      tone: "text-amber-700",
      advice:
        "You have client work but no infrastructure. Three things to fix this quarter: a niche statement, a rate card with anchor, and a CA conversation. Pick one this week.",
    };
  } else {
    band = {
      label: "Pre-practice",
      tone: "text-destructive",
      advice:
        "You're either just starting or still in job-with-side-income mode. That's fine. Get the brochures, start with the AI Advisor, and aim to apply for the next batch — the structure is exactly what's missing.",
    };
  }

  return (
    <>
      <p className="mt-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
        Free tool
      </p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-primary leading-tight">
        Founder Vital Signs
      </h1>
      <p className="mt-4 text-base text-foreground leading-relaxed">
        10 yes/no questions. Score 0–100. Tells you exactly where your practice is fragile.
        Based on the 10 things Captain checks in every batch founder.
      </p>

      <div className="mt-10 space-y-3">
        {VITAL_QS.map((q, i) => (
          <label
            key={i}
            className="flex items-start gap-3 rounded-md border border-border bg-card p-3 cursor-pointer hover:border-accent"
          >
            <input
              type="checkbox"
              checked={answers[i]}
              onChange={(e) =>
                setAnswers((a) => a.map((v, idx) => (idx === i ? e.target.checked : v)))
              }
              className="mt-1 h-4 w-4 accent-accent"
            />
            <span className="text-sm text-foreground">{q.q}</span>
          </label>
        ))}
      </div>

      <Button
        type="button"
        size="lg"
        onClick={() => {
          setSubmitted(true);
          track("tool_complete", { tool: "vital-signs", score });
        }}
        className="mt-6"
      >
        See my score
      </Button>

      {submitted && (
        <div className="mt-10 rounded-2xl border-2 border-accent bg-card p-6 md:p-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
            Your vital signs
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="font-display text-5xl text-primary">{score}</p>
            <p className="text-sm text-muted-foreground">/ 100</p>
            <p className={`ml-3 font-display text-xl ${band.tone}`}>· {band.label}</p>
          </div>
          <p className="mt-5 text-sm text-foreground leading-relaxed">{band.advice}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/cohort"
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              See the 12-week batch →
            </Link>
            <Link
              to="/ai-advisor"
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Ask the AI about your weakest answer
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Compliance Calendar                                                */
/* ------------------------------------------------------------------ */

type Filer = {
  date: string;
  who: string;
  what: string;
  why: string;
};

function ComplianceCalendar() {
  const [hasGst, setHasGst] = React.useState(true);
  const [hasTds, setHasTds] = React.useState(false);
  const [entity, setEntity] = React.useState<"proprietor" | "llp" | "pvtltd">("proprietor");
  const [generated, setGenerated] = React.useState(false);

  React.useEffect(() => {
    track("tool_view", { tool: "compliance-calendar" });
  }, []);

  function buildCalendar(): Filer[] {
    const items: Filer[] = [];
    // GST monthly returns (GSTR-1 + GSTR-3B). GSTR-1 by 11th, GSTR-3B by 20th.
    if (hasGst) {
      for (let m = 0; m < 12; m++) {
        const d1 = monthLabel(m + 1, 11);
        const d2 = monthLabel(m + 1, 20);
        items.push({
          date: d1,
          who: "GST",
          what: "GSTR-1 (outward supplies)",
          why: `Sales / invoices for ${monthName(m)} reported.`,
        });
        items.push({
          date: d2,
          who: "GST",
          what: "GSTR-3B + tax payment",
          why: `Net tax payable for ${monthName(m)}.`,
        });
      }
      items.push({
        date: "31 Dec",
        who: "GST",
        what: "GSTR-9 annual return",
        why: "Mandatory if turnover > ₹2 Cr.",
      });
    }
    // Income tax
    items.push({
      date: "15 Jun",
      who: "Income Tax",
      what: "Advance tax — Instalment 1 (15% of liability)",
      why: "Skip → 1% interest per month under Section 234C.",
    });
    items.push({
      date: "15 Sep",
      who: "Income Tax",
      what: "Advance tax — Instalment 2 (45% cumulative)",
      why: "Skip → 1% interest per month.",
    });
    items.push({
      date: "15 Dec",
      who: "Income Tax",
      what: "Advance tax — Instalment 3 (75% cumulative)",
      why: "Skip → 1% interest per month.",
    });
    items.push({
      date: "15 Mar",
      who: "Income Tax",
      what: "Advance tax — Instalment 4 (100%)",
      why: "Last chance before financial year ends.",
    });
    items.push({
      date: "31 Jul",
      who: "Income Tax",
      what: "ITR filing (non-audit cases)",
      why: "Late = ₹5,000 penalty + interest.",
    });
    items.push({
      date: "30 Sep / 31 Oct",
      who: "Income Tax",
      what: "ITR filing (audit cases)",
      why: "Required if turnover > ₹1 Cr (business) or ₹50L (profession).",
    });
    // TDS
    if (hasTds) {
      ["31 Jul", "31 Oct", "31 Jan", "31 May"].forEach((d, i) => {
        items.push({
          date: d,
          who: "TDS",
          what: `Quarterly TDS return — Q${i + 1}`,
          why: "Required if you deducted TDS from any payment (24Q salaries, 26Q non-salaries).",
        });
      });
    }
    // MCA / ROC
    if (entity === "pvtltd") {
      items.push({
        date: "30 Sep",
        who: "MCA / ROC",
        what: "Form AOC-4 (financial statements)",
        why: "Mandatory for Pvt Ltd. ₹100/day penalty for delay.",
      });
      items.push({
        date: "29 Oct",
        who: "MCA / ROC",
        what: "Form MGT-7 (annual return)",
        why: "Pvt Ltd annual return. ₹100/day penalty for delay.",
      });
      items.push({
        date: "30 Apr",
        who: "MCA / ROC",
        what: "Form MSME-1 (half-year)",
        why: "If you owe MSME suppliers > 45 days.",
      });
    } else if (entity === "llp") {
      items.push({
        date: "30 May",
        who: "MCA / ROC",
        what: "Form 11 (LLP annual return)",
        why: "Mandatory for all LLPs.",
      });
      items.push({
        date: "30 Oct",
        who: "MCA / ROC",
        what: "Form 8 (LLP statement of accounts)",
        why: "Mandatory for all LLPs.",
      });
    }
    // Sort by month order
    return items.sort((a, b) => sortDate(a.date) - sortDate(b.date));
  }

  return (
    <>
      <p className="mt-4 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
        Free tool
      </p>
      <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-primary leading-tight">
        Compliance Calendar
      </h1>
      <p className="mt-4 text-base text-foreground leading-relaxed">
        Tell us your business shape. We'll build your personalised 12-month list of GST, income
        tax, TDS, and ROC deadlines — with the penalty for missing each one.
      </p>

      <div className="mt-10 space-y-5">
        <div>
          <Label>Entity type</Label>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as typeof entity)}
            className="mt-1.5 w-full h-11 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="proprietor">Sole Proprietor</option>
            <option value="llp">LLP</option>
            <option value="pvtltd">Private Limited (Pvt Ltd)</option>
          </select>
        </div>
        <label className="flex items-start gap-3 rounded-md border border-border bg-card p-3 cursor-pointer hover:border-accent">
          <input
            type="checkbox"
            checked={hasGst}
            onChange={(e) => setHasGst(e.target.checked)}
            className="mt-1 h-4 w-4 accent-accent"
          />
          <span className="text-sm text-foreground">I have a GSTIN (or plan to register)</span>
        </label>
        <label className="flex items-start gap-3 rounded-md border border-border bg-card p-3 cursor-pointer hover:border-accent">
          <input
            type="checkbox"
            checked={hasTds}
            onChange={(e) => setHasTds(e.target.checked)}
            className="mt-1 h-4 w-4 accent-accent"
          />
          <span className="text-sm text-foreground">
            I deduct TDS (have a TAN, pay salaries or large vendor invoices)
          </span>
        </label>
        <Button
          type="button"
          size="lg"
          onClick={() => {
            setGenerated(true);
            track("tool_complete", { tool: "compliance-calendar", entity });
          }}
        >
          Build my calendar
        </Button>
      </div>

      {generated && (
        <div className="mt-10">
          <h2 className="font-display text-xl text-primary">
            Your 12-month compliance calendar
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Dates are for the financial year. GST monthly dates repeat every month.
          </p>
          <div className="mt-5 rounded-2xl border-2 border-accent bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Authority</th>
                  <th className="text-left px-4 py-3">What's due</th>
                </tr>
              </thead>
              <tbody>
                {buildCalendar()
                  .slice(0, 60)
                  .map((f, i) => (
                    <tr
                      key={`${f.date}-${f.what}-${i}`}
                      className="border-t border-border align-top"
                    >
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-primary">
                        {f.date}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{f.who}</td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{f.what}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{f.why}</p>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/services/$slug"
              params={{ slug: "compliance-subscription" }}
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Get our team to file all of this — ₹2,499/mo
            </Link>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.print();
                track("tool_share", { tool: "compliance-calendar", action: "print" });
              }}
            >
              Print / Save as PDF
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function monthLabel(month: number, day: number) {
  return `${String(day).padStart(2, "0")} ${MONTHS[(month - 1) % 12]}`;
}
function monthName(idx: number) {
  return MONTHS[idx % 12];
}
function sortDate(d: string) {
  // expects "DD MMM" or "DD MMM / DD MMM" — sort by first occurrence
  const first = d.split("/")[0].trim();
  const [dayStr, monStr] = first.split(" ");
  const m = MONTHS.indexOf(monStr);
  if (m === -1) return 99 * 100 + 99;
  return (m === 0 || m === 1 || m === 2 ? m + 12 : m - 3) * 100 + parseInt(dayStr, 10);
  // April-start fiscal year ordering: Apr=0, May=1 ... Mar=11
}
