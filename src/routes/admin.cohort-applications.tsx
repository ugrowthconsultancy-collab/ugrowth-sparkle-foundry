import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable, fmtDate, fmtDateShort } from "@/components/admin/AdminTable";
import { DetailDrawer, JsonBlock } from "@/components/admin/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fetchProfileNames } from "@/lib/admin/profile-names";
import { logAdminAction } from "@/lib/admin/log";

export const Route = createFileRoute("/admin/cohort-applications")({
  component: ApplicationsPage,
});

type Row = {
  id: string;
  created_at: string;
  profile_id: string;
  profile_name?: string;
  cohort_id: string;
  cohort_name?: string;
  screening_status: string;
  payment_status: string;
  ai_pre_screen_score: number | null;
  ai_pre_screen_notes: string | null;
  captain_notes: string | null;
  enrolled_at: string | null;
  application_data: unknown;
  payment_link: string | null;
};

const SCREENING = ["pending", "shortlisted", "accepted", "rejected", "waitlisted"].map((v) => ({ value: v, label: v }));
const PAYMENT = ["not_sent", "sent", "paid", "expired"].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

function ApplicationsPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);
  const [refresh, setRefresh] = React.useState(0);
  const [captainNotes, setCaptainNotes] = React.useState("");

  React.useEffect(() => {
    if (selected) setCaptainNotes(selected.captain_notes ?? "");
  }, [selected]);

  const enrich = React.useCallback(async (rows: Row[]) => {
    const [pn, cohorts] = await Promise.all([
      fetchProfileNames(rows.map((r) => r.profile_id)),
      supabase.from("cohorts").select("id, name").in("id", Array.from(new Set(rows.map((r) => r.cohort_id)))),
    ]);
    const cmap = Object.fromEntries((cohorts.data ?? []).map((c) => [c.id, c.name]));
    return rows.map((r) => ({
      ...r,
      profile_name: pn[r.profile_id],
      cohort_name: cmap[r.cohort_id],
    }));
  }, []);

  async function setScreening(row: Row, status: string, note?: string) {
    const updates: Record<string, unknown> = { screening_status: status };
    if (status === "accepted") updates.enrolled_at = new Date().toISOString();
    const { error } = await supabase.from("cohort_applications").update(updates).eq("id", row.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: `cohort_application.${status}`,
      entity_type: "cohort_applications",
      entity_id: row.id,
      notes: `${status} for ${row.profile_name ?? row.profile_id.slice(0, 8)}${note ? ` — ${note}` : ""}`,
    });
    toast.success(`Application ${status}`);
    setSelected(null);
    setRefresh((n) => n + 1);
  }

  async function sendPaymentLink(row: Row) {
    const link = `https://pay.placeholder/${row.id}`;
    const { error } = await supabase
      .from("cohort_applications")
      .update({ payment_status: "sent", payment_link: link })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "cohort_application.payment_link_sent",
      entity_type: "cohort_applications",
      entity_id: row.id,
      notes: "Placeholder payment link generated",
    });
    toast.success("Payment link generated (placeholder)");
    setSelected(null);
    setRefresh((n) => n + 1);
  }

  async function saveCaptainNotes(row: Row) {
    if (captainNotes === (row.captain_notes ?? "")) return;
    const { error } = await supabase
      .from("cohort_applications")
      .update({ captain_notes: captainNotes })
      .eq("id", row.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "cohort_application.note",
      entity_type: "cohort_applications",
      entity_id: row.id,
      notes: "Captain notes updated",
    });
    toast.success("Notes saved");
  }

  return (
    <>
      <AdminTable<Row>
        title="Cohort Applications"
        table="cohort_applications"
        emptyDescription="Applications will show up here as users apply."
        refreshKey={refresh}
        enrich={enrich}
        filters={[
          { key: "screening_status", label: "Screening", options: SCREENING },
          { key: "payment_status", label: "Payment", options: PAYMENT },
        ]}
        columns={[
          { key: "created_at", label: "Applied", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "profile_name", label: "Applicant" },
          { key: "cohort_name", label: "Cohort" },
          {
            key: "screening_status", label: "Screening",
            render: (r) => <Badge variant="outline">{r.screening_status}</Badge>,
            csv: (r) => r.screening_status,
          },
          { key: "ai_pre_screen_score", label: "AI Score" },
          {
            key: "payment_status", label: "Payment",
            render: (r) => <Badge variant="outline">{r.payment_status}</Badge>,
            csv: (r) => r.payment_status,
          },
          { key: "enrolled_at", label: "Enrolled", render: (r) => fmtDateShort(r.enrolled_at) },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.profile_name ?? "Application"}
        description={selected?.cohort_name}
        fields={
          selected
            ? [
                { label: "Screening status", value: selected.screening_status },
                { label: "Payment status", value: selected.payment_status },
                { label: "AI pre-screen score", value: selected.ai_pre_screen_score },
                { label: "AI pre-screen notes", value: selected.ai_pre_screen_notes },
                { label: "Application data", value: <JsonBlock value={selected.application_data} /> },
                {
                  label: "Captain notes",
                  value: (
                    <Textarea
                      value={captainNotes}
                      onChange={(e) => setCaptainNotes(e.target.value)}
                      onBlur={() => saveCaptainNotes(selected)}
                      placeholder="Add notes..."
                      rows={4}
                    />
                  ),
                },
                { label: "Payment link", value: selected.payment_link },
              ]
            : []
        }
        footer={
          selected && (
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" onClick={() => setScreening(selected, "accepted")}>Accept</Button>
              <Button size="sm" variant="ghost" onClick={() => setScreening(selected, "waitlisted")}>Waitlist</Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  const reason = window.prompt("Reason for rejection?") ?? undefined;
                  setScreening(selected, "rejected", reason);
                }}
              >
                Reject
              </Button>
              <Button size="sm" variant="ghost" onClick={() => sendPaymentLink(selected)}>
                Send Payment Link
              </Button>
            </div>
          )
        }
      />
    </>
  );
}
