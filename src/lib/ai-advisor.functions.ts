import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { callGemini, pickModel, UGROWTH_SYSTEM_PROMPT, type GeminiMessage } from "@/lib/gemini";

const ANON_LIMIT = 5;
const DAILY_LIMIT = 30;

const FALLBACK_REPLY_EN =
  "Sorry — I'm having trouble reaching the AI right now. Please try again shortly, or WhatsApp our team for an immediate response.";
const FALLBACK_REPLY_HI =
  "क्षमा करें — अभी AI से जुड़ने में दिक्कत आ रही है। कृपया कुछ देर में दोबारा कोशिश करें, या तुरंत जवाब के लिए हमारी team को WhatsApp करें।";

function titleFromContent(s: string) {
  const t = s.trim().replace(/\s+/g, " ");
  if (!t) return "Untitled conversation";
  return t.length > 40 ? t.slice(0, 40) + "…" : t;
}

async function generateAssistantReply(opts: {
  conversationId: string;
  userContent: string;
  language: "en" | "hi";
}): Promise<string> {
  // Fetch prior messages BEFORE the new user message is inserted
  const { data: prior } = await supabaseAdmin
    .from("ai_messages")
    .select("role, content, created_at")
    .eq("conversation_id", opts.conversationId)
    .order("created_at", { ascending: true })
    .limit(20);
  const history: GeminiMessage[] = (prior ?? [])
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      content: m.content,
    }));
  history.push({ role: "user", content: opts.userContent });
  const langHint =
    opts.language === "hi"
      ? "\n\nIMPORTANT: Reply in Hindi/Hinglish (Devanagari + Roman mix is fine)."
      : "\n\nIMPORTANT: Reply in English (mix Hinglish only if the user does).";
  try {
    return await callGemini({
      model: pickModel(opts.userContent),
      history,
      systemPrompt: UGROWTH_SYSTEM_PROMPT + langHint,
    });
  } catch (err) {
    console.error("[ai-advisor] Gemini call failed:", err);
    return opts.language === "hi" ? FALLBACK_REPLY_HI : FALLBACK_REPLY_EN;
  }
}

async function appendPair(opts: {
  conversationId: string;
  userContent: string;
  language: "en" | "hi";
}) {
  const { conversationId, userContent, language } = opts;
  // 1) Generate assistant reply BEFORE inserting user msg so history is clean
  const assistantContent = await generateAssistantReply({
    conversationId,
    userContent,
    language,
  });
  // 2) Insert user message
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
  // 3) Insert assistant message
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
