import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AdminTable, fmtDate, YesNo } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { Badge } from "@/components/ui/badge";
import { getAuthUserEmails } from "@/lib/admin/users.functions";

export const Route = createFileRoute("/admin/profiles")({
  component: ProfilesPage,
});

type ProfileRow = {
  id: string;
  created_at: string;
  full_name: string | null;
  preferred_name: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  current_role: string | null;
  language_preference: string | null;
  is_admin: boolean;
  consent_dpdp: boolean;
  consent_marketing: boolean;
  business_name: string | null;
  industry: string | null;
  business_age_months: number | null;
  monthly_revenue_range: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  phone_e164: string | null;
  bio: string | null;
  linkedin_url: string | null;
  email?: string;
};

const ROLE_OPTS = [
  "salaried", "side_hustling", "returning_homemaker",
  "first_gen_consultant", "tier2_dreamer", "fully_independent",
].map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

function ProfilesPage() {
  const [selected, setSelected] = React.useState<ProfileRow | null>(null);
  const fetchEmails = useServerFn(getAuthUserEmails);

  const enrich = React.useCallback(
    async (rows: ProfileRow[]) => {
      try {
        const { emails } = await fetchEmails({
          data: { userIds: rows.map((r) => r.id) },
        });
        return rows.map((r) => ({ ...r, email: emails[r.id] }));
      } catch {
        return rows;
      }
    },
    [fetchEmails],
  );

  return (
    <>
      <AdminTable<ProfileRow>
        title="Profiles"
        table="profiles"
        emptyDescription="Users will appear here as they sign up."
        searchColumns={["full_name", "preferred_name", "city"]}
        searchPlaceholder="Search by name or city..."
        enrich={enrich}
        filters={[
          { key: "city", label: "City", options: [] },
          { key: "current_role", label: "Role", options: ROLE_OPTS },
          {
            key: "language_preference",
            label: "Language",
            options: [
              { value: "en", label: "English" },
              { value: "hi", label: "हिंदी" },
            ],
          },
          {
            key: "is_admin",
            label: "Admin",
            options: [
              { value: "true", label: "Admin" },
              { value: "false", label: "User" },
            ],
          },
        ]}
        columns={[
          { key: "created_at", label: "Joined", sortable: true, render: (r) => fmtDate(r.created_at), csv: (r) => r.created_at },
          { key: "full_name", label: "Name", sortable: true, render: (r) => r.full_name ?? "—" },
          { key: "email", label: "Email", render: (r) => r.email ?? "—" },
          { key: "city", label: "City" },
          { key: "current_role", label: "Role", render: (r) => r.current_role ?? "—" },
          {
            key: "language_preference",
            label: "Lang",
            render: (r) => <Badge variant="outline">{r.language_preference?.toUpperCase()}</Badge>,
            csv: (r) => r.language_preference,
          },
          {
            key: "is_admin",
            label: "Admin",
            render: (r) => <YesNo value={r.is_admin} />,
            csv: (r) => r.is_admin,
          },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.full_name ?? selected?.preferred_name ?? "Profile"}
        description={selected?.email}
        fields={
          selected
            ? [
                { label: "Profile ID", value: selected.id },
                { label: "Email", value: selected.email },
                { label: "Phone", value: selected.phone_e164 },
                { label: "Preferred name", value: selected.preferred_name },
                { label: "City / State / PIN", value: [selected.city, selected.state, selected.pincode].filter(Boolean).join(" · ") },
                { label: "Current role", value: selected.current_role },
                { label: "Language", value: selected.language_preference },
                { label: "Business name", value: selected.business_name },
                { label: "Industry", value: selected.industry },
                { label: "Business age (months)", value: selected.business_age_months },
                { label: "Monthly revenue", value: selected.monthly_revenue_range },
                { label: "Bio", value: selected.bio },
                { label: "LinkedIn", value: selected.linkedin_url },
                { label: "UTM source", value: selected.utm_source },
                { label: "UTM medium", value: selected.utm_medium },
                { label: "UTM campaign", value: selected.utm_campaign },
                { label: "DPDP consent", value: <YesNo value={selected.consent_dpdp} /> },
                { label: "Marketing opt-in", value: <YesNo value={selected.consent_marketing} /> },
                { label: "Admin", value: <YesNo value={selected.is_admin} /> },
                { label: "Created", value: fmtDate(selected.created_at) },
              ]
            : []
        }
      />
    </>
  );
}
