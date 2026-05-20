import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/Spinner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — UGrowth Consultancy" }] }),
  component: DashboardPage,
});

const CARDS = [
  { title: "AI Advisor", body: "Coming soon" },
  { title: "Free Tools", body: "Coming soon" },
  { title: "Cohort Status", body: "Coming soon" },
  { title: "My Orders", body: "Coming soon" },
];

function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = React.useState<string>("");

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { message: "Please sign in again." } });
      return;
    }
    supabase
      .from("profiles")
      .select("preferred_name, full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const n =
          data?.preferred_name ||
          data?.full_name?.split(" ")[0] ||
          user.email?.split("@")[0] ||
          "there";
        setName(n);
      });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <section className="flex-1 flex items-center justify-center py-20">
        <Spinner />
      </section>
    );
  }

  return (
    <section className="flex-1 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl md:text-4xl text-primary text-center">
          Welcome, {name || "there"}
        </h1>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="font-display text-lg text-primary">{c.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
