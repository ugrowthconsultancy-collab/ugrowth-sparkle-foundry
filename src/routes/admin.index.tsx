import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { Spinner } from "@/components/Spinner";
import {
  Users, MessageCircle, Package, GraduationCap, RefreshCw, Wrench, LineChart, Clock,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin" }] }),
  component: AdminDashboard,
});

type Kpis = {
  profiles: number;
  signupsToday: number;
  aiConvosToday: number;
  ordersToday: number;
  monthRevenue: number;
  pendingOrders: number;
  cohortAppsOpen: number;
  activeSubs: number;
  waitlistsToday: number;
  toolOutputs7d: number;
};

function startOf(date: "day" | "month") {
  const d = new Date();
  if (date === "day") d.setHours(0, 0, 0, 0);
  else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

function AdminDashboard() {
  const [kpis, setKpis] = React.useState<Kpis | null>(null);

  React.useEffect(() => {
    (async () => {
      const today = startOf("day");
      const month = startOf("month");
      const sevenAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [
        profiles, signups, aiToday, ordersToday, monthRows, pending,
        appsOpen, subs, waitToday, tools7d,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("ai_conversations").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("service_orders").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("service_orders").select("amount_inr_paise").gte("created_at", month).in("status", ["paid", "in_progress", "completed"]),
        supabase.from("service_orders").select("id", { count: "exact", head: true }).in("status", ["created", "paid", "in_progress"]),
        supabase.from("cohort_applications").select("id", { count: "exact", head: true }).in("status", ["applied", "screening", "interview"]),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "trialing"]),
        supabase.from("waitlists").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("tools_outputs").select("id", { count: "exact", head: true }).gte("created_at", sevenAgo),
      ]);
      const rev = ((monthRows.data ?? []) as { amount_inr_paise: number }[])
        .reduce((s, r) => s + (r.amount_inr_paise ?? 0), 0) / 100;
      setKpis({
        profiles: profiles.count ?? 0,
        signupsToday: signups.count ?? 0,
        aiConvosToday: aiToday.count ?? 0,
        ordersToday: ordersToday.count ?? 0,
        monthRevenue: rev,
        pendingOrders: pending.count ?? 0,
        cohortAppsOpen: appsOpen.count ?? 0,
        activeSubs: subs.count ?? 0,
        waitlistsToday: waitToday.count ?? 0,
        toolOutputs7d: tools7d.count ?? 0,
      });
    })();
  }, []);

  if (!kpis) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Real-time snapshot. Tap any tile to dive in.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard to="/admin/profiles" Icon={Users} label="Total profiles" value={kpis.profiles.toLocaleString()} hint={`${kpis.signupsToday} today`} />
        <KpiCard to="/admin/ai-conversations" Icon={MessageCircle} label="AI conversations (today)" value={kpis.aiConvosToday.toLocaleString()} />
        <KpiCard to="/admin/service-orders" Icon={Package} label="Orders (today)" value={kpis.ordersToday.toLocaleString()} hint={`${kpis.pendingOrders} pending`} />
        <KpiCard to="/admin/service-orders" Icon={LineChart} label="Revenue (this month)" value={formatINR(kpis.monthRevenue)} highlight />
        <KpiCard to="/admin/cohort-applications" Icon={GraduationCap} label="Cohort apps in pipeline" value={kpis.cohortAppsOpen.toLocaleString()} />
        <KpiCard to="/admin/subscriptions" Icon={RefreshCw} label="Active subscriptions" value={kpis.activeSubs.toLocaleString()} />
        <KpiCard to="/admin/tool-outputs" Icon={Wrench} label="Tool outputs (7d)" value={kpis.toolOutputs7d.toLocaleString()} />
        <KpiCard to="/admin/waitlists" Icon={Clock} label="Waitlist signups (today)" value={kpis.waitlistsToday.toLocaleString()} />
      </div>
    </div>
  );
}

function KpiCard({
  to, Icon, label, value, hint, highlight,
}: {
  to: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`rounded-lg border bg-card p-4 hover:border-accent transition-colors ${highlight ? "border-accent" : "border-border"}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 font-display text-2xl text-primary">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Link>
  );
}
