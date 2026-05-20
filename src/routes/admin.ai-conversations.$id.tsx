import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/Spinner";
import { fmtDate } from "@/components/admin/AdminTable";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/ai-conversations/$id")({
  component: ConvDetailPage,
});

type Msg = {
  id: string;
  created_at: string;
  role: string;
  content: string;
  token_count: number | null;
  model_used: string | null;
};

function ConvDetailPage() {
  const { id } = Route.useParams();
  const [meta, setMeta] = React.useState<{ title: string; profile_id: string } | null>(null);
  const [msgs, setMsgs] = React.useState<Msg[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const [{ data: m }, { data: ms }] = await Promise.all([
        supabase.from("ai_conversations").select("title, profile_id").eq("id", id).maybeSingle(),
        supabase.from("ai_messages").select("*").eq("conversation_id", id).order("created_at", { ascending: true }),
      ]);
      setMeta(m as never);
      setMsgs((ms as Msg[]) ?? []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <Link to="/admin/ai-conversations" className="inline-flex items-center text-sm text-primary">
        <ChevronLeft className="h-4 w-4" /> Back to conversations
      </Link>
      <div>
        <h1 className="font-display text-2xl text-primary">{meta?.title ?? "Conversation"}</h1>
        <p className="text-xs text-muted-foreground mt-1">{msgs.length} messages</p>
      </div>
      <div className="space-y-3">
        {msgs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages.</p>
        ) : msgs.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={cn("flex", isUser ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                  isUser
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm",
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                <p className={cn("mt-1.5 text-[10px]", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {m.role} · {fmtDate(m.created_at)}
                  {m.model_used ? ` · ${m.model_used}` : ""}
                  {m.token_count != null ? ` · ${m.token_count} tok` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
