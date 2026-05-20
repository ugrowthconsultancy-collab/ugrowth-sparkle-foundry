import { supabase } from "@/integrations/supabase/client";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  let sid = sessionStorage.getItem("ug_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("ug_sid", sid);
  }
  return sid;
}

export async function track(event_name: string, payload: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  try {
    const { data } = await supabase.auth.getUser();
    await supabase.from("campaign_tracking").insert({
      event_name,
      event_payload: payload,
      session_id: getSessionId(),
      landing_page: window.location.pathname,
      referrer_url: document.referrer || null,
      profile_id: data.user?.id ?? null,
    });
  } catch {
    /* swallow */
  }
}
