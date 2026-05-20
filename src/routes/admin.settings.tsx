import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/Spinner";
import { logAdminAction } from "@/lib/admin/log";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin" }] }),
  component: AdminSettingsPage,
});

type Row = { key: string; value: string | null; description: string | null; updated_at: string };

const GROUPS: Array<{ title: string; keys: string[] }> = [
  {
    title: "UPI / Payments",
    keys: ["upi_id", "upi_payee_name"],
  },
  {
    title: "WhatsApp",
    keys: ["whatsapp_number", "whatsapp_default_message_en", "whatsapp_default_message_hi"],
  },
];

const LABELS: Record<string, string> = {
  upi_id: "UPI VPA (e.g. surendra01-3@okicici)",
  upi_payee_name: "UPI payee name (shown on the QR — e.g. Surendra Kulshrestha)",
  whatsapp_number: "WhatsApp number (E.164, e.g. +919650297779)",
  whatsapp_default_message_en: "Default WhatsApp message — English",
  whatsapp_default_message_hi: "Default WhatsApp message — Hindi",
};

function AdminSettingsPage() {
  const [rows, setRows] = React.useState<Row[] | null>(null);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("app_settings")
      .select("key, value, description, updated_at")
      .order("key");
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows((data ?? []) as Row[]);
    const v: Record<string, string> = {};
    (data ?? []).forEach((r) => (v[r.key] = r.value ?? ""));
    setValues(v);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function save(key: string) {
    setSavingKey(key);
    const next = values[key] ?? "";
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value: next }, { onConflict: "key" });
    setSavingKey(null);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "app_settings.update",
      entity_type: "app_settings",
      entity_id: key,
      notes: `Updated ${key}`,
    });
    toast.success(`Saved ${key}`);
    load();
  }

  if (!rows) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const known = new Set(GROUPS.flatMap((g) => g.keys));
  const extras = rows.filter((r) => !known.has(r.key));

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary">Platform Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Values marked here are read by the public site (UPI checkout, WhatsApp buttons). Be careful — changes go live immediately.
        </p>
      </div>

      {GROUPS.map((g) => (
        <section key={g.title} className="space-y-4">
          <h2 className="font-display text-base font-semibold text-foreground">{g.title}</h2>
          {g.keys.map((k) => (
            <SettingField
              key={k}
              k={k}
              label={LABELS[k] ?? k}
              description={rows.find((r) => r.key === k)?.description ?? ""}
              value={values[k] ?? ""}
              onChange={(v) => setValues((s) => ({ ...s, [k]: v }))}
              onSave={() => save(k)}
              saving={savingKey === k}
              multiline={k.includes("message")}
            />
          ))}
        </section>
      ))}

      {extras.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-base font-semibold text-foreground">Other</h2>
          {extras.map((r) => (
            <SettingField
              key={r.key}
              k={r.key}
              label={r.key}
              description={r.description ?? ""}
              value={values[r.key] ?? ""}
              onChange={(v) => setValues((s) => ({ ...s, [r.key]: v }))}
              onSave={() => save(r.key)}
              saving={savingKey === r.key}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function SettingField({
  k,
  label,
  description,
  value,
  onChange,
  onSave,
  saving,
  multiline,
}: {
  k: string;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <Label htmlFor={k} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
      <div className="mt-2 flex flex-col sm:flex-row gap-2">
        {multiline ? (
          <Textarea
            id={k}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={2}
            className="flex-1"
          />
        ) : (
          <Input
            id={k}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 h-10"
          />
        )}
        <Button onClick={onSave} disabled={saving} className="h-10">
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
