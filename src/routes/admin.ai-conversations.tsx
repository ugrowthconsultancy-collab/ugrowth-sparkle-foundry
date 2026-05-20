import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminTable, fmtDate, YesNo } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { fetchProfileNames } from "@/lib/admin/profile-names";

export const Route = createFileRoute("/admin/ai-conversations")({
  component: AIConvsPage,
});

type Row = {
  id: string;
  created_at: string;
  profile_id: string;
  profile_name?: string;
  title: string;
  archetype_detected: string | null;
  message_count: number;
  last_message_at: string;
  is_archived: boolean;
};

const ARCHETYPES = [
  "stuck_professional", "side_hustler", "returning_homemaker",
  "first_gen_consultant", "fully_independent", "tier2_dreamer",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

function AIConvsPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);

  const enrich = React.useCallback(async (rows: Row[]) => {
    const names = await fetchProfileNames(rows.map((r) => r.profile_id));
    return rows.map((r) => ({ ...r, profile_name: names[r.profile_id] ?? r.profile_id.slice(0, 8) }));
  }, []);

  return (
    <>
      <AdminTable<Row>
        title="AI Conversations"
        table="ai_conversations"
        emptyDescription="User conversations with the AI advisor will appear here."
        searchColumns={["title"]}
        searchPlaceholder="Search by title..."
        enrich={enrich}
        filters={[
          { key: "archetype_detected", label: "Archetype", options: ARCHETYPES },
          {
            key: "is_archived",
            label: "Archived",
            options: [
              { value: "true", label: "Archived" },
              { value: "false", label: "Active" },
            ],
          },
        ]}
        columns={[
          { key: "created_at", label: "Started", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "profile_name", label: "User" },
          { key: "title", label: "Title" },
          { key: "archetype_detected", label: "Archetype" },
          { key: "message_count", label: "Msgs", sortable: true },
          { key: "last_message_at", label: "Last msg", render: (r) => fmtDate(r.last_message_at) },
          {
            key: "is_archived", label: "Archived",
            render: (r) => <YesNo value={r.is_archived} />, csv: (r) => r.is_archived,
          },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.title ?? ""}
        description={selected ? `Started ${fmtDate(selected.created_at)}` : ""}
        fields={
          selected
            ? [
                { label: "User", value: selected.profile_name },
                { label: "Archetype", value: selected.archetype_detected },
                { label: "Messages", value: selected.message_count },
                { label: "Last message", value: fmtDate(selected.last_message_at) },
                { label: "Archived", value: <YesNo value={selected.is_archived} /> },
                {
                  label: "Conversation",
                  value: (
                    <Link
                      to="/admin/ai-conversations/$id"
                      params={{ id: selected.id }}
                      className="text-primary underline"
                    >
                      View messages →
                    </Link>
                  ),
                },
              ]
            : []
        }
      />
    </>
  );
}
