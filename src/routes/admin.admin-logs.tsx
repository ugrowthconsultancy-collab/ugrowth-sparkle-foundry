import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminTable, fmtDate } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { Badge } from "@/components/ui/badge";
import { fetchProfileNames } from "@/lib/admin/profile-names";

export const Route = createFileRoute("/admin/admin-logs")({
  component: LogsPage,
});

type Row = {
  id: string;
  created_at: string;
  admin_user_id: string | null;
  admin_user_name?: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  notes: string | null;
  ip_address: string | null;
};

function LogsPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);

  const enrich = React.useCallback(async (rows: Row[]) => {
    const names = await fetchProfileNames(rows.map((r) => r.admin_user_id));
    return rows.map((r) => ({ ...r, admin_user_name: r.admin_user_id ? names[r.admin_user_id] : undefined }));
  }, []);

  return (
    <>
      <AdminTable<Row>
        title="Admin Logs"
        table="admin_logs"
        emptyDescription="Admin actions will be logged here automatically."
        enrich={enrich}
        searchColumns={["action", "notes", "entity_type"]}
        searchPlaceholder="Search action or notes..."
        columns={[
          { key: "created_at", label: "When", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "admin_user_name", label: "Admin" },
          { key: "action", label: "Action", render: (r) => <Badge variant="outline">{r.action}</Badge>, csv: (r) => r.action },
          { key: "entity_type", label: "Entity" },
          { key: "entity_id", label: "Entity ID", render: (r) => r.entity_id ? r.entity_id.slice(0, 8) : "—" },
          { key: "notes", label: "Notes" },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.action ?? ""}
        description={selected ? fmtDate(selected.created_at) : ""}
        fields={
          selected
            ? [
                { label: "Admin", value: selected.admin_user_name ?? selected.admin_user_id },
                { label: "Action", value: selected.action },
                { label: "Entity type", value: selected.entity_type },
                { label: "Entity ID", value: selected.entity_id },
                { label: "IP address", value: selected.ip_address },
                { label: "Notes", value: selected.notes },
              ]
            : []
        }
      />
    </>
  );
}
