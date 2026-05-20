import { supabase } from "@/integrations/supabase/client";

export type PublicSettingKey =
  | "upi_id"
  | "upi_payee_name"
  | "whatsapp_number"
  | "whatsapp_default_message_en"
  | "whatsapp_default_message_hi";

const DEFAULTS: Record<PublicSettingKey, string> = {
  upi_id: "ugrowth@upi",
  upi_payee_name: "UGrowth Consultancy",
  whatsapp_number: "+919999999999",
  whatsapp_default_message_en:
    "Hi UGrowth team, I would like to know more about your services.",
  whatsapp_default_message_hi:
    "नमस्ते UGrowth team, मुझे आपकी सेवाओं के बारे में और जानना है।",
};

const cache = new Map<PublicSettingKey, string>();
const inflight = new Map<PublicSettingKey, Promise<string>>();

export async function getPublicSetting(key: PublicSettingKey): Promise<string> {
  if (cache.has(key)) return cache.get(key)!;
  if (inflight.has(key)) return inflight.get(key)!;
  const p = (async () => {
    try {
      const { data, error } = await supabase.rpc("get_public_setting", {
        p_key: key,
      });
      const v = (error || !data ? DEFAULTS[key] : (data as string)) || DEFAULTS[key];
      cache.set(key, v);
      return v;
    } catch {
      const v = DEFAULTS[key];
      cache.set(key, v);
      return v;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

/** Strip non-digits from a phone number for wa.me links. */
export function waNumber(e164OrAny: string): string {
  return e164OrAny.replace(/\D/g, "");
}

/** Build a wa.me/?text= URL. */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const num = waNumber(phone);
  const t = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${num}${t}`;
}

/** Build a UPI deep-link (upi://pay) URI. */
export function buildUpiUri(opts: {
  pa: string;
  pn: string;
  am?: number; // amount in INR (rupees, not paise)
  tn?: string; // transaction note
  tr?: string; // transaction reference id
}): string {
  const params = new URLSearchParams();
  params.set("pa", opts.pa);
  params.set("pn", opts.pn);
  params.set("cu", "INR");
  if (opts.am != null) params.set("am", opts.am.toFixed(2));
  if (opts.tn) params.set("tn", opts.tn);
  if (opts.tr) params.set("tr", opts.tr);
  return `upi://pay?${params.toString()}`;
}
