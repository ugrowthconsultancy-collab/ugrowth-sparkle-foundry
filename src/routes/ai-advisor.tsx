import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import {
  Send,
  Mic,
  Plus,
  Menu,
  Sparkles,
  MoreVertical,
  Archive,
  Trash2,
  Download,
  X,
  Shield,
  Lock,
  Crown,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/Spinner";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import {
  sendAnonMessage,
  sendAuthMessage,
  getDailyUsage,
  attachAnonConversations,
  getAnonConversation,
} from "@/lib/ai-advisor.functions";

export const Route = createFileRoute("/ai-advisor")({
  head: () => ({
    meta: [
      { title: "AI Advisor — Ask anything about your practice | UGrowth Consultancy" },
      {
        name: "description",
        content:
          "Free AI advisor trained on Captain Ankur Kulshrestha's methodology. Ask niche, pricing, GST, first-client outreach — instant answers, in English or Hindi.",
      },
      { property: "og:title", content: "UGrowth AI Advisor" },
      {
        property: "og:description",
        content: "Ask the UGrowth AI Advisor anything about starting your practice in India.",
      },
    ],
  }),
  component: AIAdvisorPage,
});

// ---------- types ----------
type Msg = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  conversation_id: string;
};
type ConvSummary = {
  id: string;
  title: string;
  last_message_at: string;
  message_count: number;
  is_archived: boolean;
};

// ---------- helpers ----------
const ANON_ID_KEY = "anon_conv_id";
const ANON_CONV_KEY = "anon_active_conv";
const DPDP_KEY = "ai_dpdp_ack";

function getAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function welcomeText(lang: "en" | "hi") {
  return lang === "hi"
    ? "नमस्ते। मैं UGrowth Consultancy सलाहकार हूं, Captain Ankur Kulshrestha की methodology पर trained। अपना practice शुरू करने या चलाने के बारे में कुछ भी पूछें — niche, pricing, business setup, first client outreach, compliance में मदद। आपके पास रोज़ 30 मुफ़्त messages हैं। पहले बताएं आप अपनी journey में कहां हैं।"
    : "Namaste. I am the UGrowth Consultancy Advisor, trained on Captain Ankur Kulshrestha's methodology — the same one used at IICTN and University of Mumbai's beauty & wellness curriculum. Ask me anything about starting or running your practice in India — niche selection, pricing, business setup, first-client outreach, compliance, daily questions. You have 30 free messages a day. Tell me where you are in your journey, and we'll go from there.";
}

const SUGGESTIONS_EN = [
  "What's a realistic price for my service?",
  "How do I find my first client?",
  "Do I need to register GST?",
];
const SUGGESTIONS_HI = [
  "मेरी service का realistic price क्या हो?",
  "पहला client कैसे ढूंढूं?",
  "क्या मुझे GST register करना ज़रूरी है?",
];

// ---------- main component ----------
function AIAdvisorPage() {
  const { user, loading: authLoading } = useAuth();
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sendAnon = useServerFn(sendAnonMessage);
  const sendAuth = useServerFn(sendAuthMessage);
  const getUsage = useServerFn(getDailyUsage);
  const attachAnon = useServerFn(attachAnonConversations);
  const fetchAnonConv = useServerFn(getAnonConversation);

  const [convId, setConvId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Msg[]>([]);
  const [convList, setConvList] = React.useState<ConvSummary[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [typing, setTyping] = React.useState(false);
  const [streamingId, setStreamingId] = React.useState<string | null>(null);
  const [streamedChars, setStreamedChars] = React.useState(0);
  const [dpdpVisible, setDpdpVisible] = React.useState(false);
  const [showSignupGate, setShowSignupGate] = React.useState(false);
  const [showDailyCap, setShowDailyCap] = React.useState(false);
  const [remainingToday, setRemainingToday] = React.useState<number | null>(null);
  const [anonUsed, setAnonUsed] = React.useState(0);
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  const [listening, setListening] = React.useState(false);

  const threadRef = React.useRef<HTMLDivElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // DPDP banner
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setDpdpVisible(localStorage.getItem(DPDP_KEY) !== "1");
  }, []);

  // page view tracking
  React.useEffect(() => {
    track("ai_advisor_view");
  }, []);

  // anon: load existing active conv
  React.useEffect(() => {
    if (authLoading) return;
    if (user) return;
    const anonId = getAnonId();
    const activeConv = localStorage.getItem(ANON_CONV_KEY);
    if (activeConv) {
      fetchAnonConv({ data: { anonId, conversationId: activeConv } })
        .then((res) => {
          if (res.conversation) {
            setConvId(activeConv);
            setMessages(res.messages as Msg[]);
            const userMsgs = (res.messages as Msg[]).filter((m) => m.role === "user").length;
            setAnonUsed(userMsgs);
          } else {
            localStorage.removeItem(ANON_CONV_KEY);
          }
        })
        .catch(() => {});
    }
  }, [authLoading, user, fetchAnonConv]);

  // auth user: load conversations + usage; attach anon conv if any
  React.useEffect(() => {
    if (!user) return;
    (async () => {
      const anonId = localStorage.getItem(ANON_ID_KEY);
      if (anonId) {
        try {
          const r = await attachAnon({ data: { anonId } });
          if (r.attached > 0) {
            track("ai_signup_after_5", { attached: r.attached });
            localStorage.removeItem(ANON_CONV_KEY);
          }
        } catch {
          /* ignore */
        }
      }
      await loadConvList();
      try {
        const u = await getUsage();
        setRemainingToday(u.remaining);
      } catch {
        /* ignore */
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadConvList() {
    if (!user) return;
    const { data } = await supabase
      .from("ai_conversations")
      .select("id, title, last_message_at, message_count, is_archived")
      .eq("profile_id", user.id)
      .eq("is_archived", false)
      .order("last_message_at", { ascending: false })
      .limit(20);
    setConvList((data ?? []) as ConvSummary[]);
  }

  async function openConversation(id: string) {
    setConvId(id);
    setLeftOpen(false);
    const { data } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    setMessages((data ?? []) as Msg[]);
  }

  function newConversation() {
    setConvId(null);
    setMessages([]);
    setLeftOpen(false);
    if (!user) {
      localStorage.removeItem(ANON_CONV_KEY);
    }
    textareaRef.current?.focus();
  }

  // auto-scroll on new message
  React.useEffect(() => {
    threadRef.current?.scrollTo({
      top: threadRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, streamedChars]);

  // streaming effect for last assistant message
  React.useEffect(() => {
    if (!streamingId) return;
    const msg = messages.find((m) => m.id === streamingId);
    if (!msg) return;
    if (streamedChars >= msg.content.length) {
      setStreamingId(null);
      return;
    }
    const step = Math.max(2, Math.floor(msg.content.length / 60));
    const t = setTimeout(() => setStreamedChars((c) => Math.min(msg.content.length, c + step)), 30);
    return () => clearTimeout(t);
  }, [streamingId, streamedChars, messages]);

  async function handleSend(rawText?: string) {
    const text = (rawText ?? input).trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);

    // anon flow
    if (!user) {
      const anonId = getAnonId();
      const isFirst = anonUsed === 0;
      // optimistic
      const tmpId = `tmp-${crypto.randomUUID()}`;
      setMessages((m) => [
        ...m,
        {
          id: tmpId,
          role: "user",
          content: text,
          created_at: new Date().toISOString(),
          conversation_id: convId ?? "",
        },
      ]);
      setTyping(true);

      try {
        const res = await sendAnon({
          data: {
            anonId,
            conversationId: convId,
            content: text,
            language: lang,
          },
        });
        if ("gated" in res && res.gated) {
          setTyping(false);
          setMessages((m) => m.filter((x) => x.id !== tmpId));
          setInput(text);
          if (res.reason === "anon_limit") {
            track("ai_signup_gate_shown", { used: res.used });
            setShowSignupGate(true);
          }
          return;
        }
        if (isFirst) track("ai_first_message");
        if (!convId) {
          localStorage.setItem(ANON_CONV_KEY, res.conversationId);
        }
        setConvId(res.conversationId);
        setAnonUsed(res.anonUsed);

        // wait simulated delay
        await new Promise((r) => setTimeout(r, 1200));
        setTyping(false);

        setMessages((m) => [
          ...m.filter((x) => x.id !== tmpId),
          { ...(res.userMsg as Msg) },
          { ...(res.assistantMsg as Msg) },
        ]);
        setStreamingId((res.assistantMsg as Msg).id);
        setStreamedChars(0);

        if (res.anonUsed >= 5) {
          track("ai_signup_gate_shown", { used: res.anonUsed });
          setTimeout(() => setShowSignupGate(true), 800);
        }
      } catch (e) {
        console.error(e);
        setTyping(false);
        setMessages((m) => m.filter((x) => x.id !== tmpId));
        setInput(text);
      } finally {
        setSending(false);
      }
      return;
    }

    // auth flow
    const tmpId = `tmp-${crypto.randomUUID()}`;
    setMessages((m) => [
      ...m,
      {
        id: tmpId,
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
        conversation_id: convId ?? "",
      },
    ]);
    setTyping(true);
    try {
      const res = await sendAuth({
        data: { conversationId: convId, content: text, language: lang },
      });
      if ("gated" in res && res.gated) {
        setTyping(false);
        setMessages((m) => m.filter((x) => x.id !== tmpId));
        setInput(text);
        if (res.reason === "daily_limit") {
          track("ai_daily_cap_hit", { used: res.used });
          setShowDailyCap(true);
        }
        return;
      }
      if (!convId) setConvId(res.conversationId);
      setRemainingToday(res.remaining);

      await new Promise((r) => setTimeout(r, 1200));
      setTyping(false);

      setMessages((m) => [
        ...m.filter((x) => x.id !== tmpId),
        { ...(res.userMsg as Msg) },
        { ...(res.assistantMsg as Msg) },
      ]);
      setStreamingId((res.assistantMsg as Msg).id);
      setStreamedChars(0);
      loadConvList();
    } catch (e) {
      console.error(e);
      setTyping(false);
      setMessages((m) => m.filter((x) => x.id !== tmpId));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  async function archiveConv(id: string) {
    await supabase.from("ai_conversations").update({ is_archived: true }).eq("id", id);
    if (convId === id) newConversation();
    loadConvList();
  }
  async function deleteConv(id: string) {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;
    await supabase.from("ai_messages").delete().eq("conversation_id", id);
    await supabase.from("ai_conversations").delete().eq("id", id);
    if (convId === id) newConversation();
    loadConvList();
  }

  function dismissDpdp() {
    localStorage.setItem(DPDP_KEY, "1");
    setDpdpVisible(false);
  }

  function handleSavePdf() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    let y = margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("UGrowth Consultancy — AI Advisor", margin, y);
    y += 22;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(new Date().toLocaleString(), margin, y);
    y += 22;
    doc.setTextColor(0);

    const all: { role: string; content: string }[] = [
      { role: "assistant", content: welcomeText(lang) },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    for (const m of all) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(m.role === "user" ? "You" : "Advisor", margin, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(m.content, usableWidth);
      for (const line of lines) {
        if (y > pageHeight - margin - 30) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 14;
      }
      y += 10;
    }
    // footer page numbers
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(140);
      doc.text(`Page ${i} of ${total} · ugrowth.in`, pageWidth / 2, pageHeight - 20, {
        align: "center",
      });
    }
    doc.save(`ugrowth-conversation-${Date.now()}.pdf`);
  }

  function startVoice() {
    const SR =
      (typeof window !== "undefined" &&
        ((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      alert("Voice input is not supported in this browser.");
      return;
    }
    // @ts-expect-error dynamic
    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (e: { results: { 0: { transcript: string } }[] }) => {
      const txt = e.results[0][0].transcript;
      setInput((cur) => (cur ? cur + " " + txt : txt));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  }

  const suggestions = lang === "hi" ? SUGGESTIONS_HI : SUGGESTIONS_EN;
  const lowRemaining =
    user && remainingToday !== null && remainingToday < 10 ? remainingToday : null;

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      {/* LEFT RAIL desktop */}
      {user && (
        <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-border bg-card/40">
          <LeftRailContent
            convList={convList}
            activeId={convId}
            onOpen={openConversation}
            onNew={newConversation}
            onArchive={archiveConv}
            onDelete={deleteConv}
          />
        </aside>
      )}

      {/* CENTER */}
      <main className="flex flex-1 flex-col min-w-0">
        {/* mobile top bar */}
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 md:px-4">
          <div className="flex items-center gap-2 min-w-0">
            {user && (
              <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <SheetHeader className="px-4 pt-4">
                    <SheetTitle>Conversations</SheetTitle>
                  </SheetHeader>
                  <LeftRailContent
                    convList={convList}
                    activeId={convId}
                    onOpen={openConversation}
                    onNew={newConversation}
                    onArchive={archiveConv}
                    onDelete={deleteConv}
                  />
                </SheetContent>
              </Sheet>
            )}
            <Sparkles className="h-4 w-4 text-accent shrink-0" />
            <h1 className="truncate font-display text-base font-semibold text-primary">
              AI Advisor
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {lowRemaining !== null && (
              <span className="text-xs text-muted-foreground">
                {lowRemaining} {lang === "hi" ? "messages बाक़ी आज" : "messages left today"}
              </span>
            )}
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Suggestions">
                  <Sparkles className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[60vh]">
                <SheetHeader>
                  <SheetTitle>{lang === "hi" ? "सुझाव" : "Try asking"}</SheetTitle>
                </SheetHeader>
                <RightRailContent
                  suggestions={suggestions}
                  onPick={(s) => {
                    setRightOpen(false);
                    handleSend(s);
                  }}
                  onSavePdf={handleSavePdf}
                  hasMessages={messages.length > 0}
                  lang={lang}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* DPDP notice */}
        {dpdpVisible && (
          <div className="mx-3 mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm md:mx-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="flex-1 text-foreground/90">
                {lang === "hi"
                  ? "आपकी बातचीत सहेजी जाती है ताकि अगली बार बेहतर जवाब मिल सकें। यह encrypted है, कभी share नहीं होती। आप कभी भी किसी conversation को delete कर सकते हैं।"
                  : "Your conversations are stored to give you better answers next time. They are encrypted and never shared. You can delete any conversation any time."}
              </p>
              <Button size="sm" variant="ghost" onClick={dismissDpdp}>
                {lang === "hi" ? "ठीक है" : "Got it"}
              </Button>
            </div>
          </div>
        )}

        {/* thread */}
        <div
          ref={threadRef}
          className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6"
        >
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            <Bubble role="assistant" content={welcomeText(lang)} streaming={false} />
            {messages.map((m) => {
              const isStreaming = streamingId === m.id;
              const content = isStreaming ? m.content.slice(0, streamedChars) : m.content;
              return <Bubble key={m.id} role={m.role} content={content} streaming={isStreaming} />;
            })}
            {typing && <TypingBubble />}
          </div>
        </div>

        {/* input */}
        <div className="border-t border-border bg-background p-3 md:p-4">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-card p-2 shadow-sm">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  lang === "hi"
                    ? "अपना सवाल पूछें..."
                    : "Ask your question..."
                }
                className="min-h-[44px] max-h-40 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-base shadow-none focus-visible:ring-0"
                rows={1}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={startVoice}
                className={cn("h-11 w-11 shrink-0", listening && "text-accent")}
                aria-label="Voice input"
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={() => handleSend()}
                disabled={sending || !input.trim()}
                className="h-11 w-11 shrink-0"
                aria-label="Send"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {!user && (
              <p className="mt-2 px-2 text-xs text-muted-foreground">
                {lang === "hi"
                  ? `${5 - anonUsed} मुफ़्त messages बाक़ी — फिर sign up करें।`
                  : `${Math.max(0, 5 - anonUsed)} free messages left — then sign up to continue.`}
              </p>
            )}
          </div>
        </div>
      </main>

      {/* RIGHT RAIL desktop */}
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-l border-border bg-card/40 p-4">
        <RightRailContent
          suggestions={suggestions}
          onPick={(s) => handleSend(s)}
          onSavePdf={handleSavePdf}
          hasMessages={messages.length > 0}
          lang={lang}
        />
      </aside>

      {/* SIGNUP GATE */}
      <Dialog open={showSignupGate} onOpenChange={setShowSignupGate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
              <Lock className="h-6 w-6 text-accent" />
            </div>
            <DialogTitle className="text-center">
              {lang === "hi" ? "जारी रखने के लिए sign up करें" : "Sign up to continue"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {lang === "hi"
                ? "आपने 5 मुफ़्त messages use कर लिए। Free account बनाएं और रोज़ 30 messages पाएं।"
                : "You've used your 5 free messages. Create a free account to continue — up to 30 messages a day."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => {
                track("ai_pro_upgrade_clicked", { from: "signup_gate" });
                navigate({ to: "/login" });
              }}
            >
              {lang === "hi" ? "Sign up — मुफ़्त" : "Sign up — it's free"}
            </Button>
            <Button variant="ghost" onClick={() => setShowSignupGate(false)}>
              {lang === "hi" ? "बाद में" : "Maybe later"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DAILY CAP */}
      <Dialog open={showDailyCap} onOpenChange={setShowDailyCap}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
              <Crown className="h-6 w-6 text-accent" />
            </div>
            <DialogTitle className="text-center">
              {lang === "hi" ? "आज की limit पूरी" : "You've hit today's limit"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {lang === "hi"
                ? "आपने आज के 30 मुफ़्त messages use कर लिए। यह आधी रात (IST) पर reset होगा। Unlimited के लिए AI Pro try करें (₹199/month)।"
                : "You've used today's 30 free messages. They reset at midnight IST. Upgrade to AI Pro (₹199/month) for unlimited."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              className="w-full"
              onClick={() => {
                track("ai_pro_upgrade_clicked", { from: "daily_cap" });
                navigate({ to: "/upgrade-pro" });
              }}
            >
              {lang === "hi" ? "AI Pro में upgrade करें" : "Upgrade to AI Pro"}
            </Button>
            <Button variant="ghost" onClick={() => setShowDailyCap(false)}>
              {lang === "hi" ? "बंद करें" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* auth loading shim */}
      {authLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40">
          <Spinner />
        </div>
      )}
      {/* suppress unused t warning */}
      <span hidden>{t("dashboard.welcome", { name: "" })}</span>
    </div>
  );
}

// ---------- sub-components ----------
function Bubble({
  role,
  content,
  streaming,
}: {
  role: "user" | "assistant" | "system";
  content: string;
  streaming: boolean;
}) {
  const isUser = role === "user";
  const [copied, setCopied] = React.useState(false);
  return (
    <div
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      )}
      onContextMenu={(e) => {
        e.preventDefault();
        navigator.clipboard?.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-accent/15 text-foreground rounded-br-sm border border-accent/30"
            : "bg-card text-foreground rounded-bl-sm border border-border",
        )}
      >
        <p className="whitespace-pre-wrap break-words">
          {content}
          {streaming && <span className="ml-0.5 inline-block animate-pulse">▍</span>}
        </p>
        {copied && (
          <p className="mt-1 text-[10px] text-muted-foreground">Copied</p>
        )}
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm">
        <span className="inline-flex items-center gap-1">
          <Dot delay={0} />
          <Dot delay={150} />
          <Dot delay={300} />
        </span>
      </div>
    </div>
  );
}
function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function LeftRailContent({
  convList,
  activeId,
  onOpen,
  onNew,
  onArchive,
  onDelete,
}: {
  convList: ConvSummary[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onNew: () => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="p-3">
        <Button onClick={onNew} className="w-full" size="sm">
          <Plus className="mr-1 h-4 w-4" /> New conversation
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {convList.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            Your past conversations will appear here.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {convList.map((c) => (
              <li key={c.id} className="group flex items-center">
                <button
                  onClick={() => onOpen(c.id)}
                  className={cn(
                    "flex-1 truncate rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted",
                    activeId === c.id && "bg-muted font-medium text-primary",
                  )}
                  title={c.title}
                >
                  {c.title}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onArchive(c.id)}>
                      <Archive className="mr-2 h-4 w-4" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(c.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function RightRailContent({
  suggestions,
  onPick,
  onSavePdf,
  hasMessages,
  lang,
}: {
  suggestions: string[];
  onPick: (s: string) => void;
  onSavePdf: () => void;
  hasMessages: boolean;
  lang: "en" | "hi";
}) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {lang === "hi" ? "ये पूछ कर देखें" : "Try asking"}
        </p>
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                onClick={() => onPick(s)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-left text-sm hover:border-accent hover:bg-accent/5"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Button
        variant="outline"
        onClick={onSavePdf}
        disabled={!hasMessages}
        className="w-full"
      >
        <Download className="mr-2 h-4 w-4" />
        {lang === "hi" ? "PDF में save करें" : "Save this conversation"}
      </Button>
      <Link to="/upgrade-pro" className="block">
        <div
          onClick={() => track("ai_pro_upgrade_clicked", { from: "right_rail" })}
          className="rounded-lg border border-accent/30 bg-accent/5 p-3 text-sm"
        >
          <p className="font-semibold text-primary">
            {lang === "hi" ? "AI Pro — unlimited" : "AI Pro — unlimited"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "hi"
              ? "₹199/month में रोज़ unlimited messages।"
              : "₹199/month for unlimited daily messages."}
          </p>
        </div>
      </Link>
    </div>
  );
}
