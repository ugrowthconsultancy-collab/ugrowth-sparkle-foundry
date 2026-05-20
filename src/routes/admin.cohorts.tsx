import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable, fmtDateShort, YesNo } from "@/components/admin/AdminTable";
import { DetailDrawer } from "@/components/admin/DetailDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/format";
import { logAdminAction } from "@/lib/admin/log";

export const Route = createFileRoute("/admin/cohorts")({
  component: CohortsPage,
});

type ProductType = "mepsc_certification" | "return_to_work" | "pricing_workshop" | "mastermind";
const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: "mepsc_certification", label: "MEPSC certification" },
  { value: "return_to_work", label: "Return to work" },
  { value: "pricing_workshop", label: "Pricing workshop" },
  { value: "mastermind", label: "Mastermind" },
];

type Cohort = {
  id: string;
  name: string;
  product_type: ProductType;
  start_date: string;
  end_date: string;
  application_deadline: string;
  max_seats: number;
  price_inr_paise: number;
  is_open: boolean;
  captain_led: boolean;
  instructor_partner_id: string | null;
  instructor_partner_name?: string;
  description: string | null;
  curriculum_url: string | null;
};

function CohortsPage() {
  const [selected, setSelected] = React.useState<Cohort | null>(null);
  const [editing, setEditing] = React.useState<Cohort | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);

  const enrich = React.useCallback(async (rows: Cohort[]) => {
    const ids = rows.map((r) => r.instructor_partner_id).filter(Boolean) as string[];
    if (!ids.length) return rows;
    const { data } = await supabase.from("partners").select("id, name").in("id", ids);
    const m = Object.fromEntries((data ?? []).map((p) => [p.id, p.name]));
    return rows.map((r) => ({
      ...r,
      instructor_partner_name: r.instructor_partner_id ? m[r.instructor_partner_id] : undefined,
    }));
  }, []);

  return (
    <>
      <AdminTable<Cohort>
        title="Cohorts"
        table="cohorts"
        emptyDescription="Create the first cohort so users can apply."
        refreshKey={refresh}
        enrich={enrich}
        defaultSort={{ column: "start_date", ascending: false }}
        newButton={{ label: "New Cohort", onClick: () => setShowNew(true) }}
        filters={[
          { key: "product_type", label: "Product", options: PRODUCT_TYPES },
          {
            key: "is_open", label: "Open",
            options: [
              { value: "true", label: "Open" },
              { value: "false", label: "Closed" },
            ],
          },
        ]}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "product_type", label: "Product" },
          { key: "start_date", label: "Starts", sortable: true, render: (r) => fmtDateShort(r.start_date) },
          { key: "end_date", label: "Ends", render: (r) => fmtDateShort(r.end_date) },
          { key: "max_seats", label: "Seats" },
          {
            key: "price_inr_paise", label: "Price",
            render: (r) => formatINR(r.price_inr_paise / 100),
            csv: (r) => r.price_inr_paise / 100,
          },
          { key: "is_open", label: "Open", render: (r) => <YesNo value={r.is_open} />, csv: (r) => r.is_open },
          { key: "captain_led", label: "Captain", render: (r) => <YesNo value={r.captain_led} />, csv: (r) => r.captain_led },
          { key: "instructor_partner_name", label: "Instructor" },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.name ?? ""}
        description={selected?.product_type}
        fields={
          selected
            ? [
                { label: "Application deadline", value: fmtDateShort(selected.application_deadline) },
                { label: "Start → End", value: `${fmtDateShort(selected.start_date)} → ${fmtDateShort(selected.end_date)}` },
                { label: "Seats", value: selected.max_seats },
                { label: "Price", value: formatINR(selected.price_inr_paise / 100) },
                { label: "Open", value: <YesNo value={selected.is_open} /> },
                { label: "Captain-led", value: <YesNo value={selected.captain_led} /> },
                { label: "Instructor", value: selected.instructor_partner_name },
                { label: "Description", value: selected.description },
                { label: "Curriculum URL", value: selected.curriculum_url },
              ]
            : []
        }
        footer={
          selected && (
            <Button className="w-full" onClick={() => { setEditing(selected); setSelected(null); }}>
              Edit cohort
            </Button>
          )
        }
      />
      <CohortForm
        open={showNew || !!editing}
        cohort={editing}
        onClose={() => { setShowNew(false); setEditing(null); }}
        onSaved={() => setRefresh((n) => n + 1)}
      />
    </>
  );
}

function CohortForm({
  open, cohort, onClose, onSaved,
}: {
  open: boolean;
  cohort: Cohort | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = React.useState({
    name: "",
    product_type: "mepsc_certification" as ProductType,
    start_date: "",
    end_date: "",
    application_deadline: "",
    max_seats: 20,
    price_inr_paise: 0,
    is_open: true,
    captain_led: true,
    description: "",
    curriculum_url: "",
  });
  const [priceRupees, setPriceRupees] = React.useState("0");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (cohort) {
      setForm({
        name: cohort.name,
        product_type: cohort.product_type,
        start_date: cohort.start_date,
        end_date: cohort.end_date,
        application_deadline: cohort.application_deadline,
        max_seats: cohort.max_seats,
        price_inr_paise: cohort.price_inr_paise,
        is_open: cohort.is_open,
        captain_led: cohort.captain_led,
        description: cohort.description ?? "",
        curriculum_url: cohort.curriculum_url ?? "",
      });
      setPriceRupees(String(cohort.price_inr_paise / 100));
    } else if (open) {
      setForm({
        name: "", product_type: "mepsc_certification",
        start_date: "", end_date: "", application_deadline: "",
        max_seats: 20, price_inr_paise: 0, is_open: true, captain_led: true,
        description: "", curriculum_url: "",
      });
      setPriceRupees("0");
    }
  }, [cohort, open]);

  async function save() {
    setSaving(true);
    const payload = { ...form, price_inr_paise: Math.round(Number(priceRupees) * 100) };
    let id = cohort?.id;
    if (cohort) {
      const { error } = await supabase.from("cohorts").update(payload).eq("id", cohort.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAdminAction({ action: "cohort.update", entity_type: "cohorts", entity_id: cohort.id, notes: `Updated cohort ${form.name}` });
    } else {
      const { data, error } = await supabase.from("cohorts").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      id = data.id;
      await logAdminAction({ action: "cohort.create", entity_type: "cohorts", entity_id: id, notes: `Created cohort ${form.name}` });
    }
    setSaving(false);
    toast.success(cohort ? "Cohort updated" : "Cohort created");
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{cohort ? "Edit cohort" : "New cohort"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="MEPSC Cohort 1 — Jul 2026" />
          </Field>
          <Field label="Product type">
            <Select value={form.product_type} onValueChange={(v) => setForm({ ...form, product_type: v as ProductType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
            <Field label="End date"><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></Field>
          </div>
          <Field label="Application deadline"><Input type="date" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Max seats"><Input type="number" value={form.max_seats} onChange={(e) => setForm({ ...form, max_seats: Number(e.target.value) })} /></Field>
            <Field label="Price (₹)"><Input type="number" value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)} /></Field>
          </div>
          <Field label="Description"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Curriculum URL"><Input value={form.curriculum_url} onChange={(e) => setForm({ ...form, curriculum_url: e.target.value })} /></Field>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.is_open} onCheckedChange={(v) => setForm({ ...form, is_open: v === true })} />
            Open for applications
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={form.captain_led} onCheckedChange={(v) => setForm({ ...form, captain_led: v === true })} />
            Captain-led
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.name || !form.start_date || !form.end_date || !form.application_deadline}>
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
