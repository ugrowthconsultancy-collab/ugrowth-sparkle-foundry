import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { ServiceDef, ServiceLang } from "@/lib/services-catalog";
import { formatInr } from "@/lib/services-catalog";
import { track } from "@/lib/track";

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone_e164: z.string().trim().regex(/^\+91[6-9]\d{9}$/, "Enter a valid +91 phone number"),
  business_name: z.string().trim().min(1).max(200),
  business_address: z.string().trim().min(5).max(500),
  gst_state: z.string().trim().min(2).max(100),
  notes: z.string().trim().max(1000).optional().default(""),
});

type Profile = {
  full_name: string | null;
  preferred_name: string | null;
  phone_e164: string | null;
  city: string | null;
  state: string | null;
  business_name: string | null;
};

export function ServiceIntakeModal({
  open,
  onOpenChange,
  service,
  lang,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: ServiceDef;
  lang: ServiceLang;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [form, setForm] = React.useState({
    full_name: "",
    email: user?.email ?? "",
    phone_e164: "+91",
    business_name: "",
    business_address: "",
    gst_state: "",
    notes: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("profiles")
      .select("full_name, preferred_name, phone_e164, city, state, business_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setProfile(data as Profile);
        setForm((f) => ({
          ...f,
          full_name: f.full_name || data.full_name || data.preferred_name || "",
          email: f.email || user.email || "",
          phone_e164: f.phone_e164 !== "+91" ? f.phone_e164 : data.phone_e164 || "+91",
          business_name: f.business_name || data.business_name || "",
          gst_state: f.gst_state || data.state || "",
        }));
      });
  }, [open, user]);

  async function submit() {
    setError(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    if (!user) {
      setError("You must be signed in");
      return;
    }
    setSubmitting(true);

    try {
      if (service.isSubscription) {
        const { data, error } = await supabase
          .from("subscriptions")
          .insert({
            profile_id: user.id,
            product: "compliance",
            billing_cycle: "monthly",
            amount_inr_paise: service.priceInrPaise,
            status: "trialing",
          })
          .select("id")
          .single();
        if (error) throw error;
        track("service_order_created", {
          service_type: service.serviceType,
          subscription_id: data.id,
          is_subscription: true,
        });
        // Subscriptions don't get an order_id_human; reuse pending page using the uuid
        navigate({ to: "/services/order-pending/$orderId", params: { orderId: data.id } });
      } else {
        const { data, error } = await supabase
          .from("service_orders")
          .insert({
            profile_id: user.id,
            service_type: service.serviceType,
            amount_inr_paise: service.priceInrPaise,
            status: "created",
            intake_data: parsed.data,
          })
          .select("id, order_id_human")
          .single();
        if (error) throw error;
        track("service_order_created", {
          service_type: service.serviceType,
          order_id: data.id,
          order_id_human: data.order_id_human,
        });
        navigate({
          to: "/services/order-pending/$orderId",
          params: { orderId: data.order_id_human ?? data.id },
        });
      }
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
      setSubmitting(false);
    }
  }

  const t = (en: string, hi: string) => (lang === "hi" ? hi : en);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-primary">
            {t("Quick intake", "त्वरित जानकारी")}
          </DialogTitle>
          <DialogDescription>
            {service.content[lang].cardName} · {formatInr(service.priceInr)}
            {service.isSubscription ? t("/mo", "/माह") : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Field
            label={t("Full name", "पूरा नाम")}
            value={form.full_name}
            onChange={(v) => setForm({ ...form, full_name: v })}
          />
          <Field
            label="Email"
            type="email"
            inputMode="email"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
          />
          <Field
            label={t("Phone (+91)", "फोन (+91)")}
            type="tel"
            inputMode="tel"
            value={form.phone_e164}
            onChange={(v) => setForm({ ...form, phone_e164: v })}
            placeholder="+919876543210"
          />
          <Field
            label={t("Business name", "व्यवसाय का नाम")}
            value={form.business_name}
            onChange={(v) => setForm({ ...form, business_name: v })}
          />
          <Field
            label={t("Business address", "व्यवसाय का पता")}
            value={form.business_address}
            onChange={(v) => setForm({ ...form, business_address: v })}
          />
          <Field
            label={t("GST state", "GST राज्य")}
            value={form.gst_state}
            onChange={(v) => setForm({ ...form, gst_state: v })}
            placeholder={profile?.state ?? ""}
          />
          <div>
            <Label className="text-sm">{t("Anything specific?", "कोई विशेष आवश्यकता?")}</Label>
            <Textarea
              className="mt-1"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              maxLength={1000}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            onClick={submit}
            disabled={submitting}
            className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
          >
            {submitting ? t("Saving…", "सहेजा जा रहा है…") : t("Continue to payment", "भुगतान पर जाएं")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <Input
        className="mt-1 h-11"
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
