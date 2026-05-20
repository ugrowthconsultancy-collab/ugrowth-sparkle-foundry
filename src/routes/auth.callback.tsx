import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/Spinner";
import { readPendingConsent, clearPendingConsent } from "@/lib/consent-store";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing you in…" }] }),
  component: CallbackPage,
});

function deriveName(email: string) {
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase())
    .join(" ") || "Friend";
}

function CallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = React.useState("Signing you in...");

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      // Wait briefly for the magic-link session to land
      for (let i = 0; i < 30; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) break;
        await new Promise((r) => setTimeout(r, 100));
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) {
        if (cancelled) return;
        navigate({
          to: "/login",
          search: { message: "That link expired. Request a new one." },
        });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, current_role")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        const pending = readPendingConsent();
        const email = user.email ?? pending?.email ?? "";
        const { error } = await supabase.from("profiles").insert({
          id: user.id,
          full_name: deriveName(email),
          consent_dpdp: pending?.consent_dpdp ?? true,
          consent_marketing: pending?.consent_marketing ?? false,
        });
        clearPendingConsent();
        if (error) {
          setStatus("Could not create your profile. Please try again.");
          return;
        }
        if (!cancelled) navigate({ to: "/onboarding" });
        return;
      }

      let postLogin: string | null = null;
      try {
        postLogin = sessionStorage.getItem("postLoginRedirect");
        if (postLogin) sessionStorage.removeItem("postLoginRedirect");
      } catch {}

      if (!profile.current_role) {
        if (!cancelled) navigate({ to: "/onboarding" });
      } else if (postLogin && postLogin.startsWith("/")) {
        if (!cancelled) navigate({ to: postLogin });
      } else {
        if (!cancelled) navigate({ to: "/dashboard" });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <section className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-sm text-muted-foreground">{status}</p>
      </div>
    </section>
  );
}
