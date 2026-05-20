import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/Spinner";
import { INDIAN_CITIES } from "@/lib/cities";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — UGrowth Consultancy" }] }),
  component: OnboardingPage,
});

type Role =
  | "salaried"
  | "side_hustling"
  | "returning_homemaker"
  | "first_gen_consultant"
  | "fully_independent"
  | "tier2_dreamer";

const ROLES: { value: Role; label: string }[] = [
  { value: "salaried", label: "I have a job and want to start something" },
  { value: "side_hustling", label: "I already do some work on the side" },
  { value: "returning_homemaker", label: "I took a career break and want to come back" },
  { value: "first_gen_consultant", label: "I just finished college and don't want a corporate job" },
  { value: "fully_independent", label: "I work with clients but need a system" },
  { value: "tier2_dreamer", label: "I'm in a small city and want to start here" },
];

function OnboardingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(true);
  const [step, setStep] = React.useState(1);
  const [role, setRole] = React.useState<Role | null>(null);
  const [city, setCity] = React.useState("");
  const [cityOther, setCityOther] = React.useState("");
  const [pincode, setPincode] = React.useState("");
  const [pinError, setPinError] = React.useState<string | null>(null);
  const [lang, setLang] = React.useState<"en" | "hi">("en");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    supabase
      .from("profiles")
      .select("current_role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.current_role) {
          navigate({ to: "/dashboard" });
        } else {
          setChecking(false);
        }
      });
  }, [loading, user, navigate]);

  if (loading || checking) {
    return (
      <section className="flex-1 flex items-center justify-center py-20">
        <Spinner />
      </section>
    );
  }

  const finalCity = city === "__other__" ? cityOther.trim() : city;

  async function finish() {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        current_role: role!,
        city: finalCity,
        pincode,
        language_preference: lang,
      })
      .eq("id", user.id);
    setSubmitting(false);
    if (!error) navigate({ to: "/dashboard" });
  }

  return (
    <section className="flex-1 flex justify-center px-4 py-8 md:py-14">
      <div className="w-full max-w-xl">
        {/* progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-primary">
              What best describes you right now?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick the one closest to your situation.
            </p>
            <div className="mt-6 space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "w-full text-left rounded-lg border p-4 min-h-14 transition-colors",
                    role === r.value
                      ? "border-accent bg-accent/5 ring-2 ring-accent"
                      : "border-border bg-card hover:bg-muted",
                  )}
                  aria-pressed={role === r.value}
                >
                  <span className="text-base text-foreground">{r.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!role}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-primary">
              Which city are you in?
            </h1>
            <div className="mt-6 space-y-5">
              <CityPicker
                value={city}
                onChange={setCity}
                otherValue={cityOther}
                onOtherChange={setCityOther}
              />
              <div className="space-y-2">
                <Label htmlFor="pincode">PIN code</Label>
                <Input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="h-11"
                  value={pincode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setPincode(v);
                    setPinError(null);
                  }}
                  onBlur={() => {
                    if (pincode && !/^\d{6}$/.test(pincode)) {
                      setPinError("Enter a 6-digit Indian PIN code.");
                    }
                  }}
                  placeholder="400001"
                />
                <p
                  className={cn(
                    "text-xs",
                    pinError ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {pinError ?? "6 digits"}
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => {
                  if (!/^\d{6}$/.test(pincode)) {
                    setPinError("Enter a 6-digit Indian PIN code.");
                    return;
                  }
                  setStep(3);
                }}
                disabled={!finalCity || !pincode}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-primary">
              What's your preferred language?
            </h1>
            <div className="mt-6 space-y-3">
              <LangCard active={lang === "en"} onClick={() => setLang("en")} label="English" />
              <LangCard
                active={lang === "hi"}
                onClick={() => setLang("hi")}
                label="हिंदी"
                hindi
              />
            </div>
            <div className="mt-8 flex justify-between gap-3">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={finish} disabled={submitting}>
                {submitting ? "Saving..." : "Finish"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function LangCard({
  active,
  onClick,
  label,
  hindi,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hindi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "w-full rounded-lg border p-4 min-h-14 text-left transition-colors",
        active
          ? "border-accent bg-accent/5 ring-2 ring-accent"
          : "border-border bg-card hover:bg-muted",
        hindi ? "font-hindi text-lg" : "text-base",
      )}
    >
      {label}
    </button>
  );
}

function CityPicker({
  value,
  onChange,
  otherValue,
  onOtherChange,
}: {
  value: string;
  onChange: (v: string) => void;
  otherValue: string;
  onOtherChange: (v: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const filtered = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    return INDIAN_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 50);
  }, [query]);

  return (
    <div className="space-y-2">
      <Label>City</Label>
      <div className="relative">
        <Input
          className="h-11"
          placeholder="Start typing your city..."
          value={
            open
              ? query
              : value === "__other__"
                ? "Other (specify)"
                : value
          }
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => setQuery(e.target.value)}
        />
        {open && (
          <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
            {filtered.map((c) => (
              <button
                type="button"
                key={c}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-muted"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(c);
                  setOpen(false);
                }}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              className="block w-full text-left px-3 py-2 text-sm border-t border-border bg-muted/40 hover:bg-muted"
              onMouseDown={(e) => {
                e.preventDefault();
                onChange("__other__");
                setOpen(false);
              }}
            >
              Other (specify)
            </button>
          </div>
        )}
      </div>
      {value === "__other__" && (
        <Input
          className="h-11"
          placeholder="Enter your city"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
        />
      )}
    </div>
  );
}
