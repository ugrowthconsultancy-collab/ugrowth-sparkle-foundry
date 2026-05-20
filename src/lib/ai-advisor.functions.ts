import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ANON_LIMIT = 5;
const DAILY_LIMIT = 30;

const STUB_REPLY_EN =
  "Thanks for your question. The AI Advisor is being trained on Captain's methodology (Brochures A + B) and will go live shortly. In the meantime, your message has been saved — Captain or our team will respond personally within 24 hours. While you wait, try our free tools (Niche Generator, Rate Card Builder) or browse the resources library.";
const STUB_REPLY_HI =
  "आपके सवाल के लिए धन्यवाद। AI Advisor अभी Captain की methodology पर train हो रहा है और जल्द live होगा। तब तक आपका message save हो गया है — Captain या हमारी team 24 घंटों में आपको personally जवाब देगी। इस बीच हमारे free tools (Niche Generator, Rate Card Builder) try करें या resources library देखें।";

function reply(lang: "en" | "hi") {
  return lang === "hi" ? STUB_REPLY_HI : STUB_REPLY_EN;
}

function titleFromContent(s: string) {
  const t = s.trim().replace(/\s+/g, " ");
  if (!t) return "Untitled conversation";
  return t.length > 40 ? t.slice(0, 40) + "…" : t;
}

async function appendPair(opts: {
  conversationId: string;
  userContent: string;
  language: "en" | "hi";
}) {
  const { conversationId, userContent, language } = opts;
  const assistantContent = reply(language);
  const { data: userMsg, error: e1 } = await supabaseAdmin
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role: "user",
      content: userContent,
    })
    .select("*")
    .single();
  if (e1) throw new Error(e1.message);
  const { data: assistantMsg, error: e2 } = await supabaseAdmin
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: assistantContent,
    })
    .select("*")
    .single();
  if (e2) throw new Error(e2.message);

  // bump conversation counters
  const { data: conv } = await supabaseAdmin
    .from("ai_conversations")
    .select("message_count, title")
    .eq("id", conversationId)
    .single();
  const newCount = (conv?.message_count ?? 0) + 2;
  const shouldRetitle = !conv?.title || conv.title === "Untitled conversation";
  await supabaseAdmin
    .from("ai_conversations")
    .update({
      message_count: newCount,
      last_message_at: new Date().toISOString(),
      ...(shouldRetitle ? { title: titleFromContent(userContent) } : {}),
    })
    .eq("id", conversationId);

  return { userMsg, assistantMsg };
}

export const sendAnonMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        anonId: z.string().uuid(),
        conversationId: z.string().uuid().nullable().optional(),
        content: z.string().min(1).max(4000),
        language: z.enum(["en", "hi"]).default("en"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // count prior user messages across all anon conversations for this anonId
    const { data: convs } = await supabaseAdmin
      .from("ai_conversations")
      .select("id")
      .eq("anon_id", data.anonId);
    const convIds = (convs ?? []).map((c) => c.id);
    let usedSoFar = 0;
    if (convIds.length > 0) {
      const { count } = await supabaseAdmin
        .from("ai_messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", convIds)
        .eq("role", "user");
      usedSoFar = count ?? 0;
    }
    if (usedSoFar >= ANON_LIMIT) {
      return {
        gated: true as const,
        reason: "anon_limit" as const,
        used: usedSoFar,
        limit: ANON_LIMIT,
      };
    }

    // ensure conversation exists & belongs to this anon
    let conversationId = data.conversationId ?? null;
    if (conversationId) {
      const { data: existing } = await supabaseAdmin
        .from("ai_conversations")
        .select("id, anon_id")
        .eq("id", conversationId)
        .maybeSingle();
      if (!existing || existing.anon_id !== data.anonId) {
        conversationId = null;
      }
    }
    if (!conversationId) {
      const { data: created, error } = await supabaseAdmin
        .from("ai_conversations")
        .insert({
          anon_id: data.anonId,
          profile_id: null,
          title: titleFromContent(data.content),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      conversationId = created!.id;
    }

    const { userMsg, assistantMsg } = await appendPair({
      conversationId: conversationId!,
      userContent: data.content,
      language: data.language,
    });

    return {
      gated: false as const,
      conversationId: conversationId!,
      userMsg,
      assistantMsg,
      anonUsed: usedSoFar + 1,
      anonLimit: ANON_LIMIT,
    };
  });

export const sendAuthMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        conversationId: z.string().uuid().nullable().optional(),
        content: z.string().min(1).max(4000),
        language: z.enum(["en", "hi"]).default("en"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const today = new Date().toISOString().slice(0, 10);

    // current usage row
    const { data: usage } = await supabaseAdmin
      .from("ai_usage_daily")
      .select("id, messages_count")
      .eq("profile_id", userId)
      .eq("usage_date", today)
      .maybeSingle();
    const used = usage?.messages_count ?? 0;
    if (used >= DAILY_LIMIT) {
      return {
        gated: true as const,
        reason: "daily_limit" as const,
        used,
        limit: DAILY_LIMIT,
      };
    }

    // conversation ownership
    let conversationId = data.conversationId ?? null;
    if (conversationId) {
      const { data: existing } = await supabaseAdmin
        .from("ai_conversations")
        .select("id, profile_id")
        .eq("id", conversationId)
        .maybeSingle();
      if (!existing || existing.profile_id !== userId) {
        conversationId = null;
      }
    }
    if (!conversationId) {
      const { data: created, error } = await supabaseAdmin
        .from("ai_conversations")
        .insert({
          profile_id: userId,
          title: titleFromContent(data.content),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      conversationId = created!.id;
    }

    const { userMsg, assistantMsg } = await appendPair({
      conversationId: conversationId!,
      userContent: data.content,
      language: data.language,
    });

    // upsert usage
    if (usage) {
      await supabaseAdmin
        .from("ai_usage_daily")
        .update({ messages_count: used + 1 })
        .eq("id", usage.id);
    } else {
      await supabaseAdmin.from("ai_usage_daily").insert({
        profile_id: userId,
        usage_date: today,
        messages_count: 1,
        tier: "free",
      });
    }

    return {
      gated: false as const,
      conversationId: conversationId!,
      userMsg,
      assistantMsg,
      used: used + 1,
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT - (used + 1),
    };
  });

export const getDailyUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabaseAdmin
      .from("ai_usage_daily")
      .select("messages_count")
      .eq("profile_id", context.userId)
      .eq("usage_date", today)
      .maybeSingle();
    const used = data?.messages_count ?? 0;
    return { used, limit: DAILY_LIMIT, remaining: Math.max(0, DAILY_LIMIT - used) };
  });

export const attachAnonConversations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ anonId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: updated, error } = await supabaseAdmin
      .from("ai_conversations")
      .update({ profile_id: context.userId, anon_id: null })
      .eq("anon_id", data.anonId)
      .is("profile_id", null)
      .select("id");
    if (error) throw new Error(error.message);
    return { attached: updated?.length ?? 0 };
  });

export const getAnonConversation = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        anonId: z.string().uuid(),
        conversationId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: conv } = await supabaseAdmin
      .from("ai_conversations")
      .select("id, title, anon_id, profile_id")
      .eq("id", data.conversationId)
      .maybeSingle();
    if (!conv || conv.anon_id !== data.anonId) {
      return { conversation: null, messages: [] };
    }
    const { data: messages } = await supabaseAdmin
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    return { conversation: conv, messages: messages ?? [] };
  });
