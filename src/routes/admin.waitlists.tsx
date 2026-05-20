import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminTable, fmtDate } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";

export const Route = createFileRoute("/admin/waitlists")({
  component: WaitlistsPage,
});

type Row = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  product_interested_in: string;
  priority: number;
  notes: string | null;
};

function WaitlistsPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);
  return (
    <>
      <AdminTable<Row>
        title="Waitlists"
        table="waitlists"
        emptyDescription="Emails captured from waitlist forms will appear here."
        searchColumns={["email", "name", "product_interested_in"]}
        searchPlaceholder="Search email, name, or product..."
        columns={[
          { key: "created_at", label: "Joined", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "email", label: "Email" },
          { key: "name", label: "Name" },
          { key: "product_interested_in", label: "Product" },
          { key: "priority", label: "Priority", sortable: true },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.email ?? ""}
        fields={
          selected
            ? [
                { label: "Email", value: selected.email },
                { label: "Name", value: selected.name },
                { label: "Product interested in", value: selected.product_interested_in },
                { label: "Priority", value: selected.priority },
                { label: "Notes", value: selected.notes },
                { label: "Joined", value: fmtDate(selected.created_at) },
              ]
            : []
        }
      />
    </>
  );
}
