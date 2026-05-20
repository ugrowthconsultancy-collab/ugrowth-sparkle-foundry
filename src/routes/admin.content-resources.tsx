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
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { logAdminAction } from "@/lib/admin/log";

export const Route = createFileRoute("/admin/content-resources")({
  component: ContentPage,
});

type ContentType = "article" | "framework_pdf" | "template" | "checklist" | "video" | "podcast";
type Stage = "plan_start" | "manage_grow" | "scale_exit" | "all";
type Lang = "en" | "hi";

const TYPES: { value: ContentType; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "framework_pdf", label: "Framework PDF" },
  { value: "template", label: "Template" },
  { value: "checklist", label: "Checklist" },
  { value: "video", label: "Video" },
  { value: "podcast", label: "Podcast" },
];
const STAGES: { value: Stage; label: string }[] = [
  { value: "plan_start", label: "Plan / start" },
  { value: "manage_grow", label: "Manage / grow" },
  { value: "scale_exit", label: "Scale / exit" },
  { value: "all", label: "All stages" },
];

type Row = {
  id: string;
  title: string;
  slug: string;
  content_type: ContentType;
  business_stage: Stage;
  language: Lang;
  is_published: boolean;
  is_featured: boolean;
  download_count: number;
  body_markdown: string | null;
  pdf_url: string | null;
  thumbnail_url: string | null;
  topic_tags: string[];
  audience_tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
};

function ContentPage() {
  const [selected, setSelected] = React.useState<Row | null>(null);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [showNew, setShowNew] = React.useState(false);
  const [refresh, setRefresh] = React.useState(0);

  return (
    <>
      <AdminTable<Row>
        title="Content Resources"
        table="content_resources"
        emptyDescription="Publish your first article, framework, or template."
        searchColumns={["title", "slug"]}
        searchPlaceholder="Search title or slug..."
        refreshKey={refresh}
        newButton={{ label: "New Resource", onClick: () => setShowNew(true) }}
        filters={[
          { key: "content_type", label: "Type", options: TYPES },
          { key: "language", label: "Language", options: [{ value: "en", label: "English" }, { value: "hi", label: "हिंदी" }] },
          { key: "is_published", label: "Published", options: [{ value: "true", label: "Published" }, { value: "false", label: "Draft" }] },
          { key: "is_featured", label: "Featured", options: [{ value: "true", label: "Featured" }, { value: "false", label: "—" }] },
        ]}
        columns={[
          { key: "title", label: "Title", sortable: true },
          { key: "slug", label: "Slug" },
          { key: "content_type", label: "Type" },
          { key: "business_stage", label: "Stage" },
          { key: "language", label: "Lang", render: (r) => <Badge variant="outline">{r.language.toUpperCase()}</Badge>, csv: (r) => r.language },
          { key: "is_published", label: "Published", render: (r) => <YesNo value={r.is_published} />, csv: (r) => r.is_published },
          { key: "is_featured", label: "Featured", render: (r) => <YesNo value={r.is_featured} />, csv: (r) => r.is_featured },
          { key: "download_count", label: "Downloads" },
        ]}
        onRowClick={(r) => setSelected(r)}
      />
      <DetailDrawer
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected?.title ?? ""}
        description={selected?.slug}
        fields={
          selected
            ? [
                { label: "Type", value: selected.content_type },
                { label: "Stage", value: selected.business_stage },
                { label: "Language", value: selected.language },
                { label: "Published", value: <YesNo value={selected.is_published} /> },
                { label: "Featured", value: <YesNo value={selected.is_featured} /> },
                { label: "Downloads", value: selected.download_count },
                { label: "PDF URL", value: selected.pdf_url },
                { label: "Thumbnail", value: selected.thumbnail_url },
                {
                  label: "Topic tags",
                  value: selected.topic_tags?.length ? selected.topic_tags.join(", ") : null,
                },
                {
                  label: "Audience tags",
                  value: selected.audience_tags?.length ? selected.audience_tags.join(", ") : null,
                },
                { label: "SEO title", value: selected.seo_title },
                { label: "SEO description", value: selected.seo_description },
                { label: "Body", value: selected.body_markdown ? <pre className="text-xs whitespace-pre-wrap">{selected.body_markdown}</pre> : null },
                { label: "Created", value: fmtDate(selected.created_at) },
              ]
            : []
        }
        footer={
          selected && (
            <Button className="w-full" onClick={() => { setEditing(selected); setSelected(null); }}>
              Edit resource
            </Button>
          )
        }
      />
      <ContentForm
        open={showNew || !!editing}
        item={editing}
        onClose={() => { setShowNew(false); setEditing(null); }}
        onSaved={() => setRefresh((n) => n + 1)}
      />
    </>
  );
}

function ContentForm({
  open, item, onClose, onSaved,
}: { open: boolean; item: Row | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState({
    title: "", slug: "", content_type: "article" as ContentType,
    business_stage: "all" as Stage, language: "en" as Lang,
    body_markdown: "", pdf_url: "", thumbnail_url: "",
    topic_tags: "", audience_tags: "",
    seo_title: "", seo_description: "",
    is_published: false, is_featured: false,
  });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (item) {
      setForm({
        title: item.title, slug: item.slug,
        content_type: item.content_type, business_stage: item.business_stage,
        language: item.language,
        body_markdown: item.body_markdown ?? "",
        pdf_url: item.pdf_url ?? "",
        thumbnail_url: item.thumbnail_url ?? "",
        topic_tags: (item.topic_tags ?? []).join(", "),
        audience_tags: (item.audience_tags ?? []).join(", "),
        seo_title: item.seo_title ?? "",
        seo_description: item.seo_description ?? "",
        is_published: item.is_published, is_featured: item.is_featured,
      });
    } else if (open) {
      setForm({
        title: "", slug: "", content_type: "article", business_stage: "all", language: "en",
        body_markdown: "", pdf_url: "", thumbnail_url: "",
        topic_tags: "", audience_tags: "",
        seo_title: "", seo_description: "",
        is_published: false, is_featured: false,
      });
    }
  }, [item, open]);

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      topic_tags: form.topic_tags.split(",").map((s) => s.trim()).filter(Boolean),
      audience_tags: form.audience_tags.split(",").map((s) => s.trim()).filter(Boolean),
    };
    let id = item?.id;
    if (item) {
      const { error } = await supabase.from("content_resources").update(payload).eq("id", item.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
      await logAdminAction({ action: "content.update", entity_type: "content_resources", entity_id: item.id, notes: `Updated "${form.title}"` });
    } else {
      const { data, error } = await supabase.from("content_resources").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      id = data.id;
      await logAdminAction({ action: "content.create", entity_type: "content_resources", entity_id: id, notes: `Created "${form.title}"` });
    }
    setSaving(false);
    toast.success(item ? "Resource updated" : "Resource created");
    onSaved();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{item ? "Edit resource" : "New resource"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="how-to-start" /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Type">
              <Select value={form.content_type} onValueChange={(v) => setForm({ ...form, content_type: v as ContentType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Stage">
              <Select value={form.business_stage} onValueChange={(v) => setForm({ ...form, business_stage: v as Stage })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
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
          <Field label="Body (Markdown)">
            <Textarea rows={8} value={form.body_markdown} onChange={(e) => setForm({ ...form, body_markdown: e.target.value })} placeholder="# Heading..." />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="PDF URL"><Input value={form.pdf_url} onChange={(e) => setForm({ ...form, pdf_url: e.target.value })} /></Field>
            <Field label="Thumbnail URL"><Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} /></Field>
          </div>
          <Field label="Topic tags (comma separated)"><Input value={form.topic_tags} onChange={(e) => setForm({ ...form, topic_tags: e.target.value })} /></Field>
          <Field label="Audience tags (comma separated)"><Input value={form.audience_tags} onChange={(e) => setForm({ ...form, audience_tags: e.target.value })} /></Field>
          <Field label="SEO title"><Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></Field>
          <Field label="SEO description"><Textarea value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></Field>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v === true })} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v === true })} />
              Featured
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || !form.title || !form.slug}>
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
