import * as React from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { savePendingConsent } from "@/lib/consent-store";

const searchSchema = z.object({
  email: z.string().optional(),
  message: z.string().optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Sign in — UGrowth Consultancy" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = React.useState(search.email ?? "");
  const [dpdp, setDpdp] = React.useState(false);
  const [marketing, setMarketing] = React.useState(true);
  const [sent, setSent] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (!loading && user) {
      let dest = search.redirect;
      if (!dest) {
        try {
          dest = sessionStorage.getItem("postLoginRedirect") ?? undefined;
        } catch {}
      }
      if (dest && dest.startsWith("/")) {
        try {
          sessionStorage.removeItem("postLoginRedirect");
        } catch {}
        navigate({ to: dest as any });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [loading, user, navigate, search.redirect]);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = emailOk && dpdp && !submitting && cooldown === 0;

  async function send() {
    setError(null);
    setSubmitting(true);
    const e = email.trim();
    savePendingConsent({ consent_dpdp: dpdp, consent_marketing: marketing, email: e });
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: window.location.origin + "/auth/callback" },
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
    setCooldown(30);
  }

  return (
    <section className="flex-1 flex items-center justify-center px-4 py-10 md:py-16">
      <div className="w-full max-w-md bg-card md:border md:border-border md:rounded-xl md:shadow-sm p-6 md:p-8">
        {!sent ? (
          <>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-primary">
              Sign in to UGrowth Consultancy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email. We'll send you a one-time login link.
            </p>

            {search.message && (
              <div className="mt-4 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-foreground">
                {search.message}
              </div>
            )}

            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (canSubmit) send();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={dpdp}
                  onCheckedChange={(v) => setDpdp(v === true)}
                  className="mt-0.5"
                  aria-label="Consent required"
                />
                <span className="text-foreground leading-snug">
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

              <label className="flex items-start gap-3 text-sm">
                <Checkbox
                  checked={marketing}
                  onCheckedChange={(v) => setMarketing(v === true)}
                  className="mt-0.5"
                />
                <span className="text-foreground leading-snug">
                  Send me one useful template per week. No spam, unsubscribe any time.
                </span>
              </label>

              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={!canSubmit}>
                {submitting ? "Sending..." : "Send me a login link"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                The link works for both sign-in and sign-up.
              </p>
            </form>
          </>
        ) : (
          <>
            <h1 className="font-display text-2xl font-semibold text-primary">
              Check your inbox
            </h1>
            <p className="mt-3 text-sm text-foreground">
              We sent a link to <span className="font-medium">{email}</span>. Click it to
              sign in.
            </p>
            <div className="mt-6 space-y-3">
              <Button
                variant="ghost"
                className="w-full"
                disabled={cooldown > 0 || submitting}
                onClick={send}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend link"}
              </Button>
              <button
                type="button"
                className="w-full text-sm text-primary underline"
                onClick={() => {
                  setSent(false);
                  setCooldown(0);
                }}
              >
                Try a different email
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
