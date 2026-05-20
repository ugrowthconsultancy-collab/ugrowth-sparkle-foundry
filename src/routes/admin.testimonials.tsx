import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminTable, fmtDate, YesNo } from "@/components/admin/AdminTable";
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
import { logAdminAction } from "@/lib/admin/log";

export const Route = createFileRoute("/admin/testimonials")({
  component: TestimonialsPage,
});

type Lang = "en" | "hi";
type Row = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_city: string | null;
  customer_designation: string | null;
  customer_photo_url: string | null;
  testimonial_text: string;
  product_used: string | null;
  star_rating: number | null;
  permission_to_publish: boolean;
  is_featured: boolean;
  language: Lang;
};

function TestimonialsPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);

  return (
    <>
      <AdminTable<Row>
        title="Testimonials"
        table="testimonials"
        emptyDescription="Capture customer quotes to feature across the site."
        refreshKey={refresh}
        searchColumns={["customer_name", "testimonial_text"]}
        searchPlaceholder="Search name or quote..."
        newButton={{ label: "New Testimonial", onClick: () => setShowNew(true) }}
        filters={[
          { key: "is_featured", label: "Featured", options: [{ value: "true", label: "Featured" }, { value: "false", label: "—" }] },
          { key: "permission_to_publish", label: "Permission", options: [{ value: "true", label: "Granted" }, { value: "false", label: "—" }] },
          { key: "language", label: "Language", options: [{ value: "en", label: "English" }, { value: "hi", label: "हिंदी" }] },
        ]}
        columns={[
          { key: "customer_name", label: "Customer", sortable: true },
          { key: "customer_city", label: "City" },
          { key: "product_used", label: "Product" },
          { key: "star_rating", label: "★" },
          { key: "is_featured", label: "Featured", render: (r) => <YesNo value={r.is_featured} />, csv: (r) => r.is_featured },
          { key: "permission_to_publish", label: "Permission", render: (r) => <YesNo value={r.permission_to_publish} />, csv: (r) => r.permission_to_publish },
          { key: "language", label: "Lang" },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.customer_name ?? ""}
        description={selected?.customer_designation ?? selected?.customer_city ?? ""}
        fields={
          selected
            ? [
                { label: "Quote", value: <p className="italic">"{selected.testimonial_text}"</p> },
                { label: "City", value: selected.customer_city },
                { label: "Designation", value: selected.customer_designation },
                { label: "Product used", value: selected.product_used },
                { label: "Stars", value: selected.star_rating },
                { label: "Photo URL", value: selected.customer_photo_url },
                { label: "Featured", value: <YesNo value={selected.is_featured} /> },
                { label: "Permission to publish", value: <YesNo value={selected.permission_to_publish} /> },
                { label: "Created", value: fmtDate(selected.created_at) },
              ]
            : []
        }
        footer={
          selected && (
            <Button className="w-full" onClick={() => { setEditing(selected); setSelected(null); }}>
              Edit
            </Button>
          )
        }
      />
      <TForm
        open={showNew || !!editing}
        item={editing}
        onClose={() => { setShowNew(false); setEditing(null); }}
        onSaved={() => setRefresh((n) => n + 1)}
      />
    </>
  );
}

function TForm({
  open, item, onClose, onSaved,
}: { open: boolean; item: Row | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    customer_name: "", customer_city: "", customer_designation: "",
    customer_photo_url: "", testimonial_text: "", product_used: "",
    star_rating: 5, permission_to_publish: false, is_featured: false,
    language: "en" as Lang,
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (item) {
      setForm({
        customer_name: item.customer_name,
        customer_city: item.customer_city ?? "",
        customer_designation: item.customer_designation ?? "",
        customer_photo_url: item.customer_photo_url ?? "",
        testimonial_text: item.testimonial_text,
        product_used: item.product_used ?? "",
        star_rating: item.star_rating ?? 5,
        permission_to_publish: item.permission_to_publish,
        is_featured: item.is_featured,
        language: item.language,
      });
    } else if (open) {
      setForm({
        customer_name: "", customer_city: "", customer_designation: "",
        customer_photo_url: "", testimonial_text: "", product_used: "",
        star_rating: 5, permission_to_publish: false, is_featured: false,
        language: "en",
      });
    }
  }, [item, open]);

  async function save() {
    setSaving(true);
    let id = item?.id;
    if (item) {
      const { error } = await supabase.from("testimonials").update(form).eq("id", item.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAdminAction({ action: "testimonial.update", entity_type: "testimonials", entity_id: item.id, notes: `Updated testimonial for ${form.customer_name}` });
    } else {
      const { data, error } = await supabase.from("testimonials").insert(form).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      id = data.id;
      await logAdminAction({ action: "testimonial.create", entity_type: "testimonials", entity_id: id, notes: `Added testimonial for ${form.customer_name}` });
    }
    setSaving(false);
    toast.success(item ? "Saved" : "Added");
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Edit testimonial" : "New testimonial"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Field label="Customer name"><Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><Input value={form.customer_city} onChange={(e) => setForm({ ...form, customer_city: e.target.value })} /></Field>
            <Field label="Designation"><Input value={form.customer_designation} onChange={(e) => setForm({ ...form, customer_designation: e.target.value })} /></Field>
          </div>
          <Field label="Photo URL"><Input value={form.customer_photo_url} onChange={(e) => setForm({ ...form, customer_photo_url: e.target.value })} /></Field>
          <Field label="Quote"><Textarea rows={4} value={form.testimonial_text} onChange={(e) => setForm({ ...form, testimonial_text: e.target.value })} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Product"><Input value={form.product_used} onChange={(e) => setForm({ ...form, product_used: e.target.value })} /></Field>
            <Field label="Stars (1-5)">
              <Input type="number" min={1} max={5} value={form.star_rating} onChange={(e) => setForm({ ...form, star_rating: Number(e.target.value) })} />
            </Field>
            <Field label="Language">
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v as Lang })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिंदी</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.permission_to_publish} onCheckedChange={(v) => setForm({ ...form, permission_to_publish: v === true })} />
              Permission to publish
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v === true })} />
              Featured
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.customer_name || !form.testimonial_text}>
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
