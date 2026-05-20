import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminTable, fmtDate, fmtDateShort } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { Badge } from "@/components/ui/badge";
import { fetchProfileNames } from "@/lib/admin/profile-names";
import { formatINR } from "@/lib/format";

export const Route = createFileRoute("/admin/subscriptions")({
  component: SubsPage,
});

const PRODUCTS = ["ai_pro", "alumni_community", "compliance", "circle_membership"].map((v) => ({
  value: v, label: v.replace(/_/g, " "),
}));
const STATUSES = ["active", "paused", "cancelled", "past_due", "trialing"].map((v) => ({ value: v, label: v }));
const CYCLES = ["monthly", "annual"].map((v) => ({ value: v, label: v }));

type Row = {
  id: string;
  created_at: string;
  profile_id: string;
  profile_name?: string;
  product: string;
  amount_inr_paise: number;
  billing_cycle: string;
  status: string;
  next_billing_date: string | null;
  started_at: string;
  cancelled_at: string | null;
  razorpay_subscription_id: string | null;
};

function SubsPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);

  const enrich = React.useCallback(async (rows: Row[]) => {
    const names = await fetchProfileNames(rows.map((r) => r.profile_id));
    return rows.map((r) => ({ ...r, profile_name: names[r.profile_id] }));
  }, []);

  return (
    <>
      <AdminTable<Row>
        title="Subscriptions"
        table="subscriptions"
        emptyDescription="Recurring subscriptions will appear here."
        enrich={enrich}
        filters={[
          { key: "product", label: "Product", options: PRODUCTS },
          { key: "status", label: "Status", options: STATUSES },
          { key: "billing_cycle", label: "Cycle", options: CYCLES },
        ]}
        columns={[
          { key: "created_at", label: "Started", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "profile_name", label: "Subscriber" },
          { key: "product", label: "Product" },
          {
            key: "amount_inr_paise", label: "Amount",
            render: (r) => formatINR(r.amount_inr_paise / 100),
            csv: (r) => r.amount_inr_paise / 100,
          },
          { key: "billing_cycle", label: "Cycle" },
          { key: "status", label: "Status", render: (r) => <Badge variant="outline">{r.status}</Badge>, csv: (r) => r.status },
          { key: "next_billing_date", label: "Next billing", render: (r) => fmtDateShort(r.next_billing_date) },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.product ?? ""}
        description={selected?.profile_name}
        fields={
          selected
            ? [
                { label: "Status", value: selected.status },
                { label: "Amount", value: formatINR(selected.amount_inr_paise / 100) },
                { label: "Cycle", value: selected.billing_cycle },
                { label: "Started", value: fmtDate(selected.started_at) },
                { label: "Next billing", value: fmtDateShort(selected.next_billing_date) },
                { label: "Cancelled", value: fmtDate(selected.cancelled_at) },
                { label: "Razorpay sub ID", value: selected.razorpay_subscription_id },
              ]
            : []
        }
      />
    </>
  );
}
