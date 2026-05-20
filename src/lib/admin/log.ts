import { supabase } from "@/integrations/supabase/client";

export async function logAdminAction(args: {
  action: string;
  entity_type: string;
  entity_id?: string | null;
  notes?: string;
}) {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) return;
  await supabase.from("admin_logs").insert({
    admin_user_id: uid,
    action: args.action,
    entity_type: args.entity_type,
    entity_id: args.entity_id ?? null,
    notes: args.notes ?? null,
  });
}
