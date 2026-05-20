import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Returns { [user_id]: email } for given auth user ids.
 * Caller must be an admin (profiles.is_admin = true).
 */
export const getAuthUserEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ userIds: z.array(z.string().uuid()).max(500) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .maybeSingle();
    if (!me?.is_admin) throw new Error("Forbidden");

    if (data.userIds.length === 0) return { emails: {} as Record<string, string> };

    // listUsers paginates; for an admin tool with <a few thousand users we
    // walk pages and filter to requested ids.
    const wanted = new Set(data.userIds);
    const result: Record<string, string> = {};
    let page = 1;
    while (page <= 20) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw error;
      for (const u of list.users) {
        if (wanted.has(u.id) && u.email) result[u.id] = u.email;
      }
      if (list.users.length < 200) break;
      page += 1;
    }
    return { emails: result };
  });
