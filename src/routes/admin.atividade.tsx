import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Activity, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/atividade")({
  component: ActivityPage,
});

interface Row { id: string; actor_email: string | null; action: string; entity_type: string | null; entity_id: string | null; details: Record<string, unknown>; created_at: string; }

function ActivityPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(500);
      setRows((data ?? []) as Row[]);
    })();
    const ch = supabase.channel("activity").on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_log" }, (p) => {
      setRows((r) => [p.new as Row, ...r].slice(0, 500));
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const types = Array.from(new Set(rows.map((r) => r.entity_type).filter(Boolean))) as string[];
  const filtered = rows.filter((r) => {
    if (type !== "all" && r.entity_type !== type) return false;
    if (q && !`${r.action} ${r.actor_email ?? ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl flex items-center gap-2"><Activity className="h-5 w-5 text-gold" /> Atividade</h2>
        <p className="text-sm text-muted-foreground">Auditoria em tempo real de tudo o que acontece.</p>
      </div>
      <div className="flex gap-2 mb-4">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar ação ou utilizador…" className="max-w-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
          <option value="all">Todos os tipos</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="surface-card rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">Sem registos. As ações vão aparecer aqui em tempo real.</div>
        ) : (
          <ul className="divide-y divide-border/50">
            {filtered.map((r) => (
              <li key={r.id} className="p-4 hover:bg-accent/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm"><span className="font-semibold">{r.action}</span>{r.entity_type && <span className="text-muted-foreground"> · {r.entity_type}</span>}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{r.actor_email ?? "sistema"}</p>
                    {Object.keys(r.details ?? {}).length > 0 && (
                      <pre className="text-[10px] mt-1 text-muted-foreground/70 font-mono whitespace-pre-wrap line-clamp-2">{JSON.stringify(r.details)}</pre>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-PT")}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
