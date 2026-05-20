import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminTable, fmtDate, YesNo } from "@/components/admin/AdminTable";
import { DetailDrawer, JsonBlock } from "@/components/admin/DetailDrawer";
import { fetchProfileNames } from "@/lib/admin/profile-names";

export const Route = createFileRoute("/admin/tool-outputs")({
  component: ToolsPage,
});

type Row = {
  id: string;
  created_at: string;
  profile_id: string | null;
  profile_name?: string;
  email: string | null;
  tool_name: string;
  input_data: unknown;
  output_data: unknown;
  pdf_url: string | null;
  shared_to_email: string | null;
};

const TOOLS = ["fee_calculator", "revenue_planner", "viability_score", "pricing_helper"].map((v) => ({
  value: v, label: v.replace(/_/g, " "),
}));

function ToolsPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);

  const enrich = React.useCallback(async (rows: Row[]) => {
    const names = await fetchProfileNames(rows.map((r) => r.profile_id));
    return rows.map((r) => ({
      ...r,
      profile_name: r.profile_id ? names[r.profile_id] : null,
    }));
  }, []);

  return (
    <>
      <AdminTable<Row>
        title="Tool Outputs"
        table="tools_outputs"
        emptyDescription="Outputs from free tools (fee calculator, etc.) will appear here."
        searchColumns={["email", "shared_to_email"]}
        searchPlaceholder="Search email..."
        enrich={enrich}
        filters={[
          { key: "tool_name", label: "Tool", options: TOOLS },
        ]}
        columns={[
          { key: "created_at", label: "When", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          {
            key: "who",
            label: "User",
            render: (r) => r.profile_name ?? r.email ?? <span className="text-muted-foreground">anonymous</span>,
            csv: (r) => r.profile_name ?? r.email ?? "anonymous",
          },
          { key: "tool_name", label: "Tool" },
          {
            key: "has_email", label: "Email?",
            render: (r) => <YesNo value={!!(r.email || r.shared_to_email)} />,
            csv: (r) => !!(r.email || r.shared_to_email),
          },
          {
            key: "has_pdf", label: "PDF?",
            render: (r) => <YesNo value={!!r.pdf_url} />,
            csv: (r) => !!r.pdf_url,
          },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selected.tool_name}` : ""}
        description={selected ? fmtDate(selected.created_at) : ""}
        fields={
          selected
            ? [
                { label: "User", value: selected.profile_name ?? selected.email ?? "anonymous" },
                { label: "Shared to", value: selected.shared_to_email },
                { label: "PDF URL", value: selected.pdf_url },
                { label: "Input", value: <JsonBlock value={selected.input_data} /> },
                { label: "Output", value: <JsonBlock value={selected.output_data} /> },
              ]
            : []
        }
      />
    </>
  );
}
