import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Archive, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/planos")({
  component: PlanosPage,
});

interface Task { day?: number; label?: string; outcome?: string; duration_minutes?: number }
interface Week { week?: number; focus?: string; tasks?: Array<Task | string> }
interface Row {
  id: string; user_id: string; title: string; summary: string | null; status: string;
  created_at: string; admin_notes: string | null; weekly_tasks: unknown;
}

function PlanosPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [open, setOpen] = useState<Row | null>(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const { data, error } = await supabase.from("mentor10k_plans")
      .select("id,user_id,title,summary,status,created_at,admin_notes,weekly_tasks")
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    const list = (data ?? []) as Row[];
    setRows(list);
    const ids = [...new Set(list.map((r) => r.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      setNames(Object.fromEntries((profs ?? []).map((p) => [p.id, p.full_name ?? "—"])));
    }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => rows.filter((r) =>
    (showArchived || r.status !== "archived") &&
    `${names[r.user_id] ?? ""} ${r.title}`.toLowerCase().includes(q.toLowerCase())), [rows, names, q, showArchived]);

  const saveNotes = async () => {
    if (!open) return;
    const { error } = await supabase.from("mentor10k_plans").update({ admin_notes: notes }).eq("id", open.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Notas guardadas");
    void load();
  };
  const archive = async (r: Row) => {
    if (!confirm("Arquivar este plano? O cliente deixa de o ver.")) return;
    const { error } = await supabase.from("mentor10k_plans").update({ status: "archived" }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    void load();
  };

  const weeks = (open?.weekly_tasks as Week[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Planos dos Clientes</h2>
        <p className="text-sm text-muted-foreground">Todos os planos CEO OS criados pelos clientes.</p>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input className="pl-9" placeholder="Pesquisar por cliente ou título" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} /> Mostrar arquivados
        </label>
      </div>
      <div className="surface-card rounded-xl divide-y divide-border/40">
        {filtered.length === 0 && <p className="p-8 text-center text-muted-foreground">Sem planos.</p>}
        {filtered.map((r) => (
          <div key={r.id} className="p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{names[r.user_id] ?? r.user_id}</p>
              <p className="text-sm text-muted-foreground truncate">{r.title}</p>
              <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
                <span className="px-2 rounded-full bg-muted/40">{r.status === "archived" ? "arquivado" : "ativo"}</span>
                {r.admin_notes && <span>• com notas</span>}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => { setOpen(r); setNotes(r.admin_notes ?? ""); }}><Eye className="h-3.5 w-3.5" /> Ver</Button>
            {r.status !== "archived" && <Button variant="outline" size="sm" onClick={() => archive(r)}><Archive className="h-3.5 w-3.5" /></Button>}
          </div>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{open?.title}</DialogTitle></DialogHeader>
          {open && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">{names[open.user_id]} · {new Date(open.created_at).toLocaleString()}</p>
              {open.summary && <p className="text-sm">{open.summary}</p>}
              <div>
                <p className="text-sm font-medium mb-1">Notas do administrador</p>
                <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                <Button size="sm" variant="gold" className="mt-2" onClick={saveNotes}>Guardar notas</Button>
              </div>
              {weeks.map((w, i) => (
                <div key={i} className="rounded-lg border border-border/50 p-3">
                  <p className="font-medium text-sm mb-2">Semana {w.week ?? i + 1} — {w.focus}</p>
                  <ul className="space-y-1.5 text-sm">
                    {(w.tasks ?? []).map((t, j) => typeof t === "string" ? <li key={j}>• {t}</li> : (
                      <li key={j}>
                        <span className="text-gold">Dia {t.day ?? j + 1}:</span> {t.label}
                        {t.outcome && <span className="text-muted-foreground"> → {t.outcome}</span>}
                        {t.duration_minutes ? <span className="text-muted-foreground"> ({t.duration_minutes} min)</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
