import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminTable, fmtDate, fmtDateShort, YesNo } from "@/components/admin/AdminTable";
import { DetailDrawer, JsonBlock } from "@/components/admin/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin/log";

export const Route = createFileRoute("/admin/partners")({
  component: PartnersPage,
});

type Partner = {
  id: string;
  created_at: string;
  name: string;
  partner_type: string;
  city: string;
  state: string | null;
  email: string;
  phone_e164: string | null;
  whatsapp_number: string | null;
  specialisations: string[];
  commission_split_pct: number;
  is_active: boolean;
  service_capacity: Record<string, unknown>;
  agreement_signed_date: string | null;
  bank_account_for_payouts: Record<string, unknown>;
  internal_notes: string | null;
};

const PARTNER_TYPES = ["ca", "advocate", "mentor", "workshop_speaker", "cohort_lead"].map((v) => ({
  value: v,
  label: v.replace(/_/g, " "),
}));
type PartnerType = "ca" | "advocate" | "mentor" | "workshop_speaker" | "cohort_lead";

function maskAccount(bank: Record<string, unknown>) {
  const acct = (bank?.account_number as string) ?? "";
  if (!acct) return "—";
  return `••••${acct.slice(-4)}`;
}

function PartnersPage() {
  const [selected, setSelected] = React.useState<Partner | null>(null);
  const [editing, setEditing] = React.useState<Partner | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);

  return (
    <>
      <AdminTable<Partner>
        title="Partners"
        table="partners"
        emptyDescription="Add CAs, advocates, mentors, or workshop hosts to start matching them with users."
        searchColumns={["name", "email"]}
        searchPlaceholder="Search name or email..."
        refreshKey={refresh}
        newButton={{ label: "New Partner", onClick: () => setShowNew(true) }}
        filters={[
          { key: "partner_type", label: "Type", options: PARTNER_TYPES },
          {
            key: "is_active",
            label: "Status",
            options: [
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ],
          },
        ]}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "partner_type", label: "Type" },
          { key: "city", label: "City" },
          { key: "email", label: "Email" },
          {
            key: "is_active", label: "Active",
            render: (r) => <YesNo value={r.is_active} />, csv: (r) => r.is_active,
          },
          { key: "commission_split_pct", label: "Split %", render: (r) => `${r.commission_split_pct}%` },
          { key: "agreement_signed_date", label: "Agreement signed", render: (r) => fmtDateShort(r.agreement_signed_date) },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.name ?? ""}
        description={selected ? `${selected.partner_type} · ${selected.city}` : ""}
        fields={
          selected
            ? [
                { label: "Email", value: selected.email },
                { label: "Phone", value: selected.phone_e164 },
                { label: "WhatsApp", value: selected.whatsapp_number },
                { label: "City / State", value: [selected.city, selected.state].filter(Boolean).join(" · ") },
                { label: "Active", value: <YesNo value={selected.is_active} /> },
                { label: "Commission split", value: `${selected.commission_split_pct}%` },
                {
                  label: "Specialisations",
                  value: selected.specialisations?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {selected.specialisations.map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  ) : null,
                },
                { label: "Agreement signed", value: fmtDateShort(selected.agreement_signed_date) },
                { label: "Service capacity", value: <JsonBlock value={selected.service_capacity} /> },
                { label: "Bank account (redacted)", value: maskAccount(selected.bank_account_for_payouts) },
                { label: "Internal notes", value: selected.internal_notes },
                { label: "Created", value: fmtDate(selected.created_at) },
              ]
            : []
        }
        footer={
          selected && (
            <Button
              className="w-full"
              onClick={() => {
                setEditing(selected);
                setSelected(null);
              }}
            >
              Edit partner
            </Button>
          )
        }
      />
      <PartnerForm
        open={showNew || !!editing}
        partner={editing}
        onClose={() => {
          setShowNew(false);
          setEditing(null);
        }}
        onSaved={() => setRefresh((n) => n + 1)}
      />
    </>
  );
}

function PartnerForm({
  open, partner, onClose, onSaved,
}: {
  open: boolean;
  partner: Partner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: "", partner_type: "ca", city: "", state: "", email: "",
    phone_e164: "", whatsapp_number: "", specialisations: "",
    commission_split_pct: 70, is_active: true, internal_notes: "",
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (partner) {
      setForm({
        name: partner.name,
        partner_type: partner.partner_type,
        city: partner.city,
        state: partner.state ?? "",
        email: partner.email,
        phone_e164: partner.phone_e164 ?? "",
        whatsapp_number: partner.whatsapp_number ?? "",
        specialisations: (partner.specialisations ?? []).join(", "),
        commission_split_pct: partner.commission_split_pct,
        is_active: partner.is_active,
        internal_notes: partner.internal_notes ?? "",
      });
    } else if (open) {
      setForm({
        name: "", partner_type: "ca", city: "", state: "", email: "",
        phone_e164: "", whatsapp_number: "", specialisations: "",
        commission_split_pct: 70, is_active: true, internal_notes: "",
      });
    }
  }, [partner, open]);

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      partner_type: form.partner_type as PartnerType,
      specialisations: form.specialisations
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    let id = partner?.id;
    if (partner) {
      const { error } = await supabase.from("partners").update(payload).eq("id", partner.id);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      await logAdminAction({
        action: "partner.update",
        entity_type: "partners",
        entity_id: partner.id,
        notes: `Updated partner ${form.name}`,
      });
    } else {
      const { data, error } = await supabase
        .from("partners")
        .insert(payload)
        .select("id")
        .single();
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      id = data.id;
      await logAdminAction({
        action: "partner.create",
        entity_type: "partners",
        entity_id: id,
        notes: `Created partner ${form.name}`,
      });
    }
    setSaving(false);
    toast.success(partner ? "Partner updated" : "Partner created");
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{partner ? "Edit partner" : "New partner"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Type">
            <Select
              value={form.partner_type}
              onValueChange={(v) => setForm({ ...form, partner_type: v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PARTNER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City">
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </Field>
            <Field label="State">
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </Field>
          </div>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone (+91...)">
              <Input value={form.phone_e164} onChange={(e) => setForm({ ...form, phone_e164: e.target.value })} />
            </Field>
            <Field label="WhatsApp">
              <Input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} />
            </Field>
          </div>
          <Field label="Specialisations (comma separated)">
            <Input
              value={form.specialisations}
              onChange={(e) => setForm({ ...form, specialisations: e.target.value })}
            />
          </Field>
          <Field label="Commission split %">
            <Input
              type="number"
              value={form.commission_split_pct}
              onChange={(e) => setForm({ ...form, commission_split_pct: Number(e.target.value) })}
            />
          </Field>
          <Field label="Internal notes">
            <Textarea
              value={form.internal_notes}
              onChange={(e) => setForm({ ...form, internal_notes: e.target.value })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={form.is_active}
              onCheckedChange={(v) => setForm({ ...form, is_active: v === true })}
            />
            Active
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.name || !form.email || !form.city}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
