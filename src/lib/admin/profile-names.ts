import { supabase } from "@/integrations/supabase/client";

/** Returns { profile_id: display_name } */
export async function fetchProfileNames(
  ids: Array<string | null | undefined>,
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(ids.filter(Boolean))) as string[];
  if (unique.length === 0) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, preferred_name, full_name")
    .in("id", unique);
  const out: Record<string, string> = {};
  for (const p of data ?? []) {
    out[p.id] = p.preferred_name || p.full_name || p.id.slice(0, 8);
  }
  return out;
}
