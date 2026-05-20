import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { track } from "@/lib/track";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply for the next batch — UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Apply for the 12-week UGrowth batch. Captain Ankur Kulshrestha (Retd) personally reviews every application within 5 working days.",
      },
    ],
  }),
  component: ApplyPage,
});

const ARCHETYPES = [
  { value: "salaried", label: "I have a job. I want to leave." },
  { value: "side_hustling", label: "I already do some work on the side." },
  { value: "returning_homemaker", label: "I took a break. I want to come back." },
  { value: "first_gen_consultant", label: "I just finished college and don't want a corporate job." },
  { value: "fully_independent", label: "I work with clients. I need a system." },
  { value: "tier2_dreamer", label: "I'm in a small city. I want to start here." },
] as const;

function ApplyPage() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string>("");

  const [form, setForm] = React.useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    archetype: "",
    idea: "",
    why_now: "",
    consent: false,
  });

  React.useEffect(() => {
    track("page_view", { route: "/apply" });
  }, []);

  React.useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, preferred_name, phone_e164, city")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm((f) => ({
            ...f,
            full_name: data.full_name || data.preferred_name || f.full_name,
            email: user.email || f.email,
            phone: data.phone_e164 || f.phone,
            city: data.city || f.city,
          }));
        }
      });
  }, [user]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) {
      toast.error("Please agree to the Privacy Policy and Terms before submitting.");
      return;
    }
    if (!form.archetype) {
      toast.error("Please pick the option that best describes your current situation.");
      return;
    }
    if (form.idea.trim().length < 20) {
      toast.error("Tell us more about your idea (at least a few sentences).");
      return;
    }
    setSubmitting(true);
    try {
      // Find or create a placeholder cohort to attach this application to
      let cohortId: string | null = null;
      const { data: openCohort } = await supabase
        .from("cohorts")
        .select("id")
        .eq("is_open", true)
        .order("application_deadline", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (openCohort) {
        cohortId = openCohort.id;
      } else {
        // create a placeholder TBA cohort so applications don't get orphaned
        const { data: created } = await supabase
          .from("cohorts")
          .insert({
            name: "MEPSC Cohort 1 — TBA",
            product_type: "mepsc_certification",
            start_date: "2026-07-01",
            end_date: "2026-09-23",
            application_deadline: "2026-06-25",
            max_seats: 25,
            price_inr_paise: 3000000,
            is_open: true,
            captain_led: true,
          })
          .select("id")
          .single();
        cohortId = created?.id ?? null;
      }

      const { error } = await supabase.from("cohort_applications").insert({
        profile_id: user?.id ?? null,
        cohort_id: cohortId,
        application_data: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          archetype: form.archetype,
          idea: form.idea,
          why_now: form.why_now,
          consent_dpdp: true,
          submitted_at: new Date().toISOString(),
        },
        screening_status: "pending",
      });
      if (error) throw error;

      // friendly readable id (timestamp-based, not the canonical one)
      const readable = `APP-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 9999,
      )
        .toString()
        .padStart(4, "0")}`;
      setOrderId(readable);
      setSubmitted(true);
      track("cohort_application_submitted", { archetype: form.archetype });
    } catch (err) {
      console.error(err);
      toast.error("Couldn't submit. Please try again or WhatsApp us at +91 96502 97779.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    const decisionBy = new Date();
    let added = 0;
    while (added < 5) {
      decisionBy.setDate(decisionBy.getDate() + 1);
      const day = decisionBy.getDay();
      if (day !== 0 && day !== 6) added++; // skip Sun + Sat
    }
    const decisionLabel = decisionBy.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return (
      <section className="flex-1 flex items-center justify-center px-4 py-20 bg-background">
        <div className="max-w-xl text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent text-3xl">
            ✓
          </div>
          <h1 className="mt-6 font-display text-3xl text-primary">Application received</h1>
          {orderId && (
            <p className="mt-3 text-sm text-muted-foreground">
              Reference: <span className="font-mono">{orderId}</span>
            </p>
          )}
          <p className="mt-4 text-base text-foreground leading-relaxed">
            Captain personally reviews every application. You'll hear from us by{" "}
            <strong>{decisionLabel}</strong> — over email and WhatsApp. If accepted, you'll get
            a UPI link for the ₹30,000 fee.
          </p>

          <div className="mt-8 text-left rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
              What we'd love you to do while you wait
            </p>
            <ol className="mt-3 space-y-2 text-sm text-foreground list-decimal list-inside marker:text-accent">
              <li>
                Read both brochures end-to-end (≈90 minutes total) — they cover 80% of the
                methodology.
              </li>
              <li>
                Take the Founder Vital Signs check — your score is the first thing we'll talk
                about on the call.
              </li>
              <li>
                Tell your spouse / parents you've applied. The conversation is easier before
                the deposit than after.
              </li>
            </ol>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/ai-advisor"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-medium text-accent-foreground hover:bg-accent/90"
            >
              Talk to AI Advisor
            </Link>
            <Link
              to="/tools/$slug"
              params={{ slug: "vital-signs" }}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-background px-5 text-sm font-medium text-primary hover:bg-primary/5"
            >
              Take Vital Signs check
            </Link>
            <Link
              to="/"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-muted"
            >
              Back home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 px-4 py-12 md:py-16 bg-background">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Cohort</p>
        <h1 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-primary">
          Apply for the next batch
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          12-week batch · ₹30,000 · Certificate in Professional, Business &amp; Management Consultancy (MEPSC) · 100% refund if no path to a paying client by
          Day 90.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-7">
          {/* Personal */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <Label htmlFor="full_name">Full name *</Label>
              <Input
                id="full_name"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="phone">WhatsApp number (+91) *</Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1.5"
              />
            </div>
          </div>

          {/* Archetype */}
          <div>
            <Label>What best describes you right now? *</Label>
            <RadioGroup
              className="mt-3 space-y-2"
              value={form.archetype}
              onValueChange={(v) => setForm({ ...form, archetype: v })}
            >
              {ARCHETYPES.map((a) => (
                <label
                  key={a.value}
                  className="flex items-start gap-3 rounded-md border border-border bg-card p-3 cursor-pointer hover:border-accent"
                >
                  <RadioGroupItem value={a.value} className="mt-0.5" />
                  <span className="text-sm text-foreground">{a.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Idea */}
          <div>
            <Label htmlFor="idea">What's your idea or area of work? *</Label>
            <Textarea
              id="idea"
              required
              rows={4}
              placeholder="e.g., I want to help D2C skincare brands recover lost Flipkart listings…"
              value={form.idea}
              onChange={(e) => setForm({ ...form, idea: e.target.value })}
              className="mt-1.5"
            />
          </div>

          {/* Why now */}
          <div>
            <Label htmlFor="why_now">Why this batch, why now? (500 chars max)</Label>
            <Textarea
              id="why_now"
              rows={3}
              maxLength={500}
              placeholder="What's pushing you to apply this batch and not the next one?"
              value={form.why_now}
              onChange={(e) => setForm({ ...form, why_now: e.target.value })}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {form.why_now.length}/500
            </p>
          </div>

          {/* Consent */}
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={form.consent}
              onCheckedChange={(v) => setForm({ ...form, consent: Boolean(v) })}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground">
              I agree to the{" "}
              <Link to="/privacy" className="underline text-primary">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="underline text-primary">
                Terms of Use
              </Link>
              . I understand my data is mine and I can request deletion any time.
            </span>
          </label>

          <Button type="submit" size="lg" disabled={submitting} className="w-full md:w-auto">
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Captain personally reviews every application within 5 working days.
          </p>
        </form>
      </div>
    </section>
  );
}
