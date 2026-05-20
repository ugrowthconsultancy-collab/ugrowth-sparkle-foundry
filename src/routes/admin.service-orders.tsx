import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable, fmtDate, fmtDateShort } from "@/components/admin/AdminTable";
import { DetailDrawer, JsonBlock } from "@/components/admin/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchProfileNames } from "@/lib/admin/profile-names";
import { formatINR } from "@/lib/format";
import { logAdminAction } from "@/lib/admin/log";

export const Route = createFileRoute("/admin/service-orders")({
  component: ServiceOrdersPage,
});

const SERVICE_TYPES = [
  "gst_registration", "udyam", "pvt_ltd_incorporation", "llp_incorporation",
  "roc_annual_filing", "epf_setup", "trademark_filing", "fssai", "compliance_subscription",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

const STATUSES = [
  "created", "paid", "in_progress", "completed", "cancelled", "refunded",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

type Row = {
  id: string;
  order_id_human: string | null;
  created_at: string;
  completed_at: string | null;
  profile_id: string;
  profile_name?: string;
  service_type: string;
  amount_inr_paise: number;
  status: string;
  partner_ca_id: string | null;
  partner_name?: string;
  intake_data: unknown;
  customer_documents: unknown;
  notes: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  created: "bg-muted text-muted-foreground",
  paid: "bg-accent/20 text-accent-foreground",
  in_progress: "bg-primary/20 text-primary",
  completed: "bg-success text-success-foreground",
  cancelled: "bg-muted text-muted-foreground",
  refunded: "bg-destructive/20 text-destructive",
};

function ServiceOrdersPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);
  const [refresh, setRefresh] = React.useState(0);
  const [kpi, setKpi] = React.useState<{ today: number; revenue: number; pending: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      const startToday = new Date(); startToday.setHours(0, 0, 0, 0);
      const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0);
      const [{ count: today }, { data: monthRows }, { count: pending }] = await Promise.all([
        supabase.from("service_orders").select("id", { count: "exact", head: true }).gte("created_at", startToday.toISOString()),
        supabase.from("service_orders").select("amount_inr_paise").gte("created_at", startMonth.toISOString()).in("status", ["paid", "in_progress", "completed"]),
        supabase.from("service_orders").select("id", { count: "exact", head: true }).in("status", ["created", "paid", "in_progress"]),
      ]);
      const rev = (monthRows ?? []).reduce((sum: number, r: { amount_inr_paise: number }) => sum + (r.amount_inr_paise ?? 0), 0) / 100;
      setKpi({ today: today ?? 0, revenue: rev, pending: pending ?? 0 });
    })();
  }, [refresh]);

  const enrich = React.useCallback(async (rows: Row[]) => {
    const profileIds = rows.map((r) => r.profile_id);
    const partnerIds = rows.map((r) => r.partner_ca_id).filter(Boolean) as string[];
    const [pn, partners] = await Promise.all([
      fetchProfileNames(profileIds),
      partnerIds.length
        ? supabase.from("partners").select("id, name").in("id", partnerIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);
    const pmap = Object.fromEntries((partners.data ?? []).map((p) => [p.id, p.name]));
    return rows.map((r) => ({
      ...r,
      profile_name: pn[r.profile_id],
      partner_name: r.partner_ca_id ? pmap[r.partner_ca_id] : undefined,
    }));
  }, []);

  async function transition(row: Row, status: string) {
    const updates: { status: string; completed_at?: string } = { status };
    if (status === "completed") updates.completed_at = new Date().toISOString();
    const { error } = await supabase
      .from("service_orders")
      .update(updates as never)
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: `service_order.${status}`,
      entity_type: "service_orders",
      entity_id: row.id,
      notes: `Marked order ${row.order_id_human ?? row.id.slice(0, 8)} as ${status.replace(/_/g, " ")}`,
    });
    toast.success(`Order marked ${status.replace(/_/g, " ")}`);
    setSelected(null);
    setRefresh((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <Kpi label="Today's orders" value={kpi ? kpi.today.toLocaleString() : "—"} />
        <Kpi label="This month revenue" value={kpi ? formatINR(kpi.revenue) : "—"} />
        <Kpi label="Pending" value={kpi ? kpi.pending.toLocaleString() : "—"} />
      </div>

      <AdminTable<Row>
        title="Service Orders"
        table="service_orders"
        emptyDescription="No service orders yet. They'll appear here as customers place orders."
        refreshKey={refresh}
        searchColumns={["order_id_human"]}
        searchPlaceholder="Search by order ID..."
        enrich={enrich}
        filters={[
          { key: "service_type", label: "Service", options: SERVICE_TYPES },
          { key: "status", label: "Status", options: STATUSES },
        ]}
        columns={[
          { key: "created_at", label: "Placed", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "order_id_human", label: "Order ID" },
          { key: "profile_name", label: "Customer" },
          { key: "service_type", label: "Service" },
          {
            key: "amount_inr_paise", label: "Amount",
            render: (r) => formatINR(r.amount_inr_paise / 100),
            csv: (r) => r.amount_inr_paise / 100,
          },
          {
            key: "status", label: "Status",
            render: (r) => <Badge className={STATUS_COLOR[r.status] ?? ""}>{r.status.replace(/_/g, " ")}</Badge>,
            csv: (r) => r.status,
          },
          { key: "partner_name", label: "Partner CA" },
          { key: "completed_at", label: "Completed", render: (r) => fmtDateShort(r.completed_at) },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.order_id_human ?? selected?.id ?? ""}
        description={selected ? `${selected.service_type} · ${formatINR(selected.amount_inr_paise / 100)}` : ""}
        fields={
          selected
            ? [
                { label: "Customer", value: selected.profile_name },
                { label: "Status", value: selected.status },
                { label: "Partner CA", value: selected.partner_name },
                { label: "Amount", value: formatINR(selected.amount_inr_paise / 100) },
                { label: "Notes", value: selected.notes },
                { label: "Created", value: fmtDate(selected.created_at) },
                { label: "Completed", value: fmtDate(selected.completed_at) },
                { label: "Intake data", value: <JsonBlock value={selected.intake_data} /> },
                { label: "Documents", value: <JsonBlock value={selected.customer_documents} /> },
              ]
            : []
        }
        footer={
          selected && (
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="ghost" onClick={() => transition(selected, "paid")}>✓ Verify Payment</Button>
              <Button size="sm" variant="ghost" onClick={() => transition(selected, "in_progress")}>Mark In Progress</Button>
              <Button size="sm" onClick={() => transition(selected, "completed")}>Mark Completed</Button>
              <Button size="sm" variant="destructive" onClick={() => transition(selected, "refunded")}>Refund</Button>
            </div>
          )
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
