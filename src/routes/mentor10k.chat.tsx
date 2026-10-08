import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { askMentor } from "@/lib/mentor10k.functions";
import { toast } from "sonner";
import { Mentor10kBuyButton } from "@/components/Mentor10kBuyButton";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/mentor10k/chat")({
  component: Chat,
});

interface Msg { role: "user" | "assistant"; content: string; }

const FREE_MESSAGE_LIMIT = 5;

function Chat() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const call = useServerFn(askMentor);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("mentor10k_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50)
      .then(({ data }) => setMessages((data ?? []) as Msg[]));
    void supabase
      .rpc("has_mentor10k_access", { _user_id: user.id })
      .then(({ data }) => setHasAccess(!!data));
  }, [user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const usedFree = messages.filter((m) => m.role === "user").length;
  const limitReached = !hasAccess && usedFree >= FREE_MESSAGE_LIMIT;

  const send = async () => {
    if (!input.trim() || sending || limitReached) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setSending(true);
    try {
      const { reply } = await call({ data: { message: msg, language: lang } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro");
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="glass-card rounded-2xl flex flex-col h-[70vh]">
      <div className="p-4 border-b border-border/40 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-gold" />
        <p className="font-medium">CEO OS</p>
        <span className="text-xs text-muted-foreground">• Gemini</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">{t("chat.start")}</p>
            <p className="text-xs mt-2">{t("chat.example")}</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-gold/15 text-foreground border border-gold/20"
                : "bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)] border border-border/40"
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start"><div className="rounded-2xl px-4 py-2.5 bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)] border border-border/40"><Loader2 className="h-4 w-4 animate-spin text-gold" /></div></div>
        )}
        <div ref={endRef} />
      </div>

      {limitReached ? (
        <div className="p-5 border-t border-border/40 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("chat.limit")}
          </p>
          <Mentor10kBuyButton size="lg" label={t("chat.unlock")} />
        </div>
      ) : (
        <div className="p-3 border-t border-border/40 flex flex-col gap-2">
          {!hasAccess && (
            <p className="text-[11px] text-muted-foreground">
              {t("chat.trial")} — {FREE_MESSAGE_LIMIT - usedFree} {t("chat.remaining")}.
            </p>
          )}
          <div className="flex gap-2">
            <Textarea
              rows={2}
              placeholder={t("chat.placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              className="resize-none"
            />
            <Button variant="gold" size="icon" disabled={sending || !input.trim()} onClick={() => void send()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
