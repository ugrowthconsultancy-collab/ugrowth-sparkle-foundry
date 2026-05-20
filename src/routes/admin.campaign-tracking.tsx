import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable, fmtDate } from "@/components/admin/AdminTable";
import { DetailDrawer, JsonBlock } from "@/components/admin/DetailDrawer";
import { fetchProfileNames } from "@/lib/admin/profile-names";

export const Route = createFileRoute("/admin/campaign-tracking")({
  component: CampaignPage,
});

type Row = {
  id: string;
  created_at: string;
  event_name: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  landing_page: string;
  referrer_url: string | null;
  session_id: string;
  profile_id: string | null;
  profile_name?: string;
  event_payload: unknown;
};

function CampaignPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);
  const [kpi, setKpi] = React.useState<{
    today: number; week: number; topSource: string; topEvent: string;
  } | null>(null);

  React.useEffect(() => {
    (async () => {
      const now = new Date();
      const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
      const startWeek = new Date(now); startWeek.setDate(now.getDate() - 7);

      const [{ count: today }, { count: week }, { data: agg }] = await Promise.all([
        supabase.from("campaign_tracking").select("id", { count: "exact", head: true }).gte("created_at", startToday.toISOString()),
        supabase.from("campaign_tracking").select("id", { count: "exact", head: true }).gte("created_at", startWeek.toISOString()),
        supabase.from("campaign_tracking").select("utm_source, event_name").limit(2000),
      ]);

      const srcCount: Record<string, number> = {};
      const evCount: Record<string, number> = {};
      (agg ?? []).forEach((r: { utm_source: string | null; event_name: string }) => {
        if (r.utm_source) srcCount[r.utm_source] = (srcCount[r.utm_source] ?? 0) + 1;
        evCount[r.event_name] = (evCount[r.event_name] ?? 0) + 1;
      });
      const top = (m: Record<string, number>) =>
        Object.entries(m).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
      setKpi({
        today: today ?? 0,
        week: week ?? 0,
        topSource: top(srcCount),
        topEvent: top(evCount),
      });
    })();
  }, []);

  const enrich = React.useCallback(async (rows: Row[]) => {
    const names = await fetchProfileNames(rows.map((r) => r.profile_id));
    return rows.map((r) => ({
      ...r,
      profile_name: r.profile_id ? names[r.profile_id] : null,
    }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Today" value={kpi ? kpi.today.toLocaleString() : "—"} />
        <Kpi label="Last 7 days" value={kpi ? kpi.week.toLocaleString() : "—"} />
        <Kpi label="Top UTM source" value={kpi?.topSource ?? "—"} />
        <Kpi label="Top event" value={kpi?.topEvent ?? "—"} />
      </div>

      <AdminTable<Row>
        title="Campaign Tracking"
        table="campaign_tracking"
        emptyDescription="UTM-tagged visits and conversion events will show up here."
        searchColumns={["event_name", "utm_campaign", "utm_source"]}
        searchPlaceholder="Search event or campaign..."
        enrich={enrich}
        columns={[
          { key: "created_at", label: "When", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "event_name", label: "Event" },
          { key: "utm_source", label: "Source" },
          { key: "utm_campaign", label: "Campaign" },
          {
            key: "user",
            label: "User",
            render: (r) => r.profile_name ?? <span className="text-muted-foreground">anonymous</span>,
            csv: (r) => r.profile_name ?? "anonymous",
          },
          { key: "landing_page", label: "Landing page" },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.event_name ?? ""}
        description={selected ? fmtDate(selected.created_at) : ""}
        fields={
          selected
            ? [
                { label: "User", value: selected.profile_name ?? "anonymous" },
                { label: "Session", value: selected.session_id },
                { label: "Landing page", value: selected.landing_page },
                { label: "Referrer", value: selected.referrer_url },
                { label: "UTM source", value: selected.utm_source },
                { label: "UTM medium", value: selected.utm_medium },
                { label: "UTM campaign", value: selected.utm_campaign },
                { label: "UTM content", value: selected.utm_content },
                { label: "Payload", value: <JsonBlock value={selected.event_payload} /> },
              ]
            : []
        }
      />
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl text-primary">{value}</p>
    </div>
  );
}
