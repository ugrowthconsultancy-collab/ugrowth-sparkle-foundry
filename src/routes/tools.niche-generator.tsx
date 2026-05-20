import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import jsPDF from "jspdf";
import { Pencil, Download, Mail, Share2, Sparkles, Check } from "lucide-react";

import { WizardShell } from "@/components/tools/WizardShell";
import { EmailGate } from "@/components/tools/EmailGate";
import { ToolFAQ } from "@/components/tools/ToolFAQ";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/track";

export const Route = createFileRoute("/tools/niche-generator")({
  head: () => ({
    meta: [
      {
        title:
          "Free Niche Statement Generator for Indian Consultants | UGrowth Consultancy",
      },
      {
        name: "description",
        content:
          "Answer 5 questions, get 3 ready-to-use niche statements you can put on your website, LinkedIn, and pitches. Free, no signup needed.",
      },
      {
        property: "og:title",
        content: "Free Niche Statement Generator — UGrowth Consultancy",
      },
      {
        property: "og:description",
        content:
          "Get 3 sharp niche statements for your own practice in 5 minutes.",
      },
      { property: "og:url", content: "/tools/niche-generator" },
    ],
    links: [{ rel: "canonical", href: "/tools/niche-generator" }],
  }),
  component: NicheGeneratorPage,
});

type Answers = {
  skill: string;
  audiences: [string, string, string];
  chosen: string;
  problem: string;
  location: string;
  badSolution: string;
};

const initial: Answers = {
  skill: "",
  audiences: ["", "", ""],
  chosen: "",
  problem: "",
  location: "",
  badSolution: "",
};

const FAQ = [
  {
    q: "Is this really free? What's the catch?",
    a: "It's genuinely free. We're UGrowth Consultancy — we make money from our paid batch and done-for-you services. Free tools build trust. No catch.",
  },
  {
    q: "Will I get spammed if I share my email?",
    a: "No. We send the niche statements once, plus one useful template per week. Unsubscribe with one click any time. We never sell your data.",
  },
  {
    q: "How do I actually use these statements?",
    a: "Pick the one that feels most natural in your voice. Put it on your LinkedIn headline, your website hero, and use it when someone asks 'so, what do you do?'.",
  },
];

function buildOutputs(a: Answers) {
  const skill = a.skill.trim() || "your expertise";
  const aud = a.chosen.trim() || "your ideal clients";
  const problem = a.problem.trim() || "their biggest problem";
  const location = a.location.trim() || "your area";
  const bad = a.badSolution.trim() || "manual workarounds";
  const outcome = problem
    .replace(/^they\s+/i, "")
    .replace(/[.?!]+$/, "")
    .toLowerCase();
  const deliverable = problem
    .split(/[.?!]/)[0]
    .replace(/[.?!]+$/, "")
    .toLowerCase();
  return [
    {
      id: "A",
      label: "The helper formula",
      why: "Leads with the audience and the pain. People recognise themselves and lean in.",
      text: `I help ${aud} who struggle with ${problem} by ${skill}, so they can finally stop dealing with ${outcome}.`,
    },
    {
      id: "B",
      label: "The location-aware formula",
      why: "Specificity sells. Naming the city and the current bad solution makes you feel local and informed.",
      text: `I work with ${aud} in ${location} who are still solving ${problem} the hard way (typically with ${bad}). I give them a faster way using ${skill}.`,
    },
    {
      id: "C",
      label: "The outcome-led formula",
      why: "Reframes the problem as a deliverable. Useful for proposals and pitches.",
      text: `${cap(aud)} hire me when they need help with ${deliverable}. My background in ${skill} makes me the right person for this.`,
    },
  ];
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function NicheGeneratorPage() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState(1);
  const [a, setA] = React.useState<Answers>(initial);
  const [outputs, setOutputs] = React.useState<ReturnType<typeof buildOutputs> | null>(null);
  const [showEmail, setShowEmail] = React.useState(false);
  const [emailCaptured, setEmailCaptured] = React.useState<string | null>(null);
  const [outputRowId, setOutputRowId] = React.useState<string | null>(null);
  const [editIdx, setEditIdx] = React.useState<number | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [shareCopied, setShareCopied] = React.useState(false);

  React.useEffect(() => {
    track("tool_started", { tool: "niche_generator" });
  }, []);

  const canContinue = (() => {
    if (step === 1) return a.skill.trim().length >= 3;
    if (step === 2) return a.audiences.filter((x) => x.trim().length >= 2).length >= 1;
    if (step === 3) return !!a.chosen;
    if (step === 4) return a.problem.trim().length >= 3;
    if (step === 5)
      return a.location.trim().length >= 2 && a.badSolution.trim().length >= 2;
    return true;
  })();

  function handleContinue() {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }
    const o = buildOutputs(a);
    setOutputs(o);
    track("tool_completed", { tool: "niche_generator" });
    setShowEmail(true);
  }

  async function handleEmail(email: string) {
    const { data, error } = await supabase
      .from("tools_outputs")
      .insert({
        tool_name: "niche_generator",
        input_data: a as never,
        output_data: outputs as never,
        email,
      })
      .select("id")
      .single();
    if (error) {
      console.error(error);
      return;
    }
    setOutputRowId(data?.id ?? null);
    setEmailCaptured(email);
    track("email_captured", { tool: "niche_generator" });
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
    doc.text("Your Niche Statements", margin, y);
    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("UGrowth Consultancy · ugrowth.in", margin, y);
    doc.setTextColor(0);
    y += 24;
    outputs.forEach((o) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${o.id} — ${o.label}`, margin, y);
      y += 16;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(o.text, w - margin * 2);
      lines.forEach((ln: string) => {
        doc.text(ln, margin, y);
        y += 16;
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(110);
      const wh = doc.splitTextToSize(`Why this works: ${o.why}`, w - margin * 2);
      wh.forEach((ln: string) => {
        doc.text(ln, margin, y);
        y += 12;
      });
      doc.setTextColor(0);
      y += 12;
    });
    doc.save(`ugrowth-niche-statements-${Date.now()}.pdf`);
  }

  function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard?.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 1800);
    track("share_clicked", { tool: "niche_generator" });
  }

  function openEdit(idx: number) {
    if (!outputs) return;
    setEditIdx(idx);
    setEditValue(outputs[idx].text);
  }
  function saveEdit() {
    if (editIdx === null || !outputs) return;
    const next = outputs.map((o, i) =>
      i === editIdx ? { ...o, text: editValue } : o,
    );
    setOutputs(next);
    if (outputRowId) {
      supabase
        .from("tools_outputs")
        .update({ output_data: next as never })
        .eq("id", outputRowId)
        .then(() => {});
    }
    setEditIdx(null);
  }

  // ---------- output view ----------
  if (outputs) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background">
        <section className="mx-auto max-w-3xl px-4 py-8 md:py-12">
          <div className="text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-primary md:text-4xl">
              Your 3 niche statements
            </h1>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Pick the one that feels most natural. Use it on LinkedIn, your
              site, and when someone asks what you do.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            {outputs.map((o, i) => (
              <article
                key={o.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {o.id} — {o.label}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(i)}
                    className="-mt-2 -mr-2"
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Customise this
                  </Button>
                </div>
                <p
                  className="mt-3 font-display text-lg italic leading-snug text-primary md:text-xl"
                  style={{ fontFamily: "Lora, serif" }}
                >
                  "{o.text}"
                </p>
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Why this works: </span>
                  {o.why}
                </p>
              </article>
            ))}
          </div>

          {/* save options after gate */}
          {emailCaptured && (
            <div className="mt-6 rounded-xl border border-border bg-card p-4">
              <p className="text-sm">
                <Check className="mr-1 inline h-4 w-4 text-accent" />
                Saved. We'll email these to{" "}
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

          {/* Soft CTA */}
          <Link
            to="/workshops"
            onClick={() =>
              track("soft_cta_clicked", { tool: "niche_generator", target: "workshops" })
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

        {/* Edit modal */}
        <Dialog open={editIdx !== null} onOpenChange={(o) => !o && setEditIdx(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Customise this statement</DialogTitle>
            </DialogHeader>
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={5}
              className="min-h-[120px]"
            />
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditIdx(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EmailGate
          open={showEmail}
          onOpenChange={setShowEmail}
          title="Your niche statements are ready"
          description="Where should we send them?"
          submitLabel="Send & save"
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
      continueLabel={step === 5 ? "Generate" : "Continue"}
    >
      {step === 1 && (
        <div>
          <Label htmlFor="skill">Your skill or experience</Label>
          <Textarea
            id="skill"
            value={a.skill}
            onChange={(e) => setA({ ...a, skill: e.target.value })}
            placeholder="e.g., 6 years of marketing for B2B SaaS companies"
            className="mt-2 min-h-[100px]"
            maxLength={300}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Examples: Marketing for SaaS · HR for IT companies · Bookkeeping for restaurants
          </p>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <Label htmlFor={`aud-${i}`}>Audience {i + 1}</Label>
              <Input
                id={`aud-${i}`}
                value={a.audiences[i]}
                onChange={(e) => {
                  const next = [...a.audiences] as Answers["audiences"];
                  next[i] = e.target.value;
                  setA({ ...a, audiences: next });
                }}
                placeholder={
                  ["Friends starting their own business", "My ex-manager", "A bakery owner I know"][i]
                }
                maxLength={120}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      )}
      {step === 3 && (
        <RadioGroup
          value={a.chosen}
          onValueChange={(v) => setA({ ...a, chosen: v })}
          className="space-y-2"
        >
          {a.audiences
            .map((aud, i) => ({ aud: aud.trim(), i }))
            .filter((x) => x.aud.length > 0)
            .map(({ aud, i }) => (
              <label
                key={i}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-accent"
              >
                <RadioGroupItem value={aud} />
                <span className="text-sm">{aud}</span>
              </label>
            ))}
        </RadioGroup>
      )}
      {step === 4 && (
        <div>
          <Label htmlFor="problem">The biggest specific problem</Label>
          <Textarea
            id="problem"
            value={a.problem}
            onChange={(e) => setA({ ...a, problem: e.target.value })}
            placeholder="e.g., they spend 3 hours a day chasing payments manually"
            className="mt-2 min-h-[100px]"
            maxLength={300}
          />
        </div>
      )}
      {step === 5 && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="loc">Location</Label>
            <Input
              id="loc"
              value={a.location}
              onChange={(e) => setA({ ...a, location: e.target.value })}
              placeholder="e.g., Tier-2 cities like Pune, Indore"
              maxLength={120}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bad">How they solve it now (badly)</Label>
            <Input
              id="bad"
              value={a.badSolution}
              onChange={(e) => setA({ ...a, badSolution: e.target.value })}
              placeholder="e.g., a clunky Excel sheet and WhatsApp follow-ups"
              maxLength={160}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </WizardShell>
  );
}

const STEP_TITLES = [
  "What's your current main skill or experience?",
  "Who are 3 types of people or businesses who have asked you for help with this?",
  "Of those, which one would you most enjoy helping?",
  "What's the biggest specific problem they have that you can solve?",
  "Where are they typically located, and how do they currently solve this (badly)?",
];
