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

export const Route = createFileRoute("/mentor10k/chat")({
  component: Chat,
});

interface Msg { role: "user" | "assistant"; content: string; }

function Chat() {
  const { user } = useAuth();
  const call = useServerFn(askMentor);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
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
  }, [user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setSending(true);
    try {
      const { reply } = await call({ data: { message: msg } });
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
        <p className="font-medium">Mentor 10K</p>
        <span className="text-xs text-muted-foreground">• Gemini</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Começa por uma pergunta. Sê específico.</p>
            <p className="text-xs mt-2">Ex: "Como valido a minha oferta em 7 dias?"</p>
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

      <div className="p-3 border-t border-border/40 flex gap-2">
        <Textarea
          rows={2}
          placeholder="Escreve a tua pergunta…"
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
  );
}
