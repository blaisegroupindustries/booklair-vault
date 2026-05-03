import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutTemplate, ChevronUp, ChevronDown, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/home")({
  component: HomeBuilderPage,
});

const KINDS = ["hero", "featured", "category", "collection", "newsletter", "testimonials", "stats", "custom_html"] as const;
type Kind = typeof KINDS[number];
interface Section { id: string; kind: Kind; title: string | null; subtitle: string | null; config: Record<string, unknown>; sort_order: number; enabled: boolean; }

function HomeBuilderPage() {
  const [rows, setRows] = useState<Section[]>([]);

  const load = async () => {
    const { data } = await supabase.from("home_sections").select("*").order("sort_order");
    setRows((data ?? []) as Section[]);
  };
  useEffect(() => { load(); }, []);

  const move = async (s: Section, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === s.id);
    const swap = rows[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("home_sections").update({ sort_order: swap.sort_order }).eq("id", s.id),
      supabase.from("home_sections").update({ sort_order: s.sort_order }).eq("id", swap.id),
    ]);
    load();
  };

  const toggle = async (s: Section) => { await supabase.from("home_sections").update({ enabled: !s.enabled }).eq("id", s.id); load(); };
  const remove = async (s: Section) => { if (!confirm("Eliminar?")) return; await supabase.from("home_sections").delete().eq("id", s.id); load(); };
  const updateField = async (s: Section, key: "title" | "subtitle", value: string) => {
    const patch = key === "title" ? { title: value } : { subtitle: value };
    await supabase.from("home_sections").update(patch).eq("id", s.id); load();
  };

  const add = async (kind: Kind) => {
    const max = rows.reduce((m, r) => Math.max(m, r.sort_order), -1);
    const { error } = await supabase.from("home_sections").insert({ kind, sort_order: max + 1, title: kind, enabled: true });
    if (error) toast.error(error.message); else load();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl flex items-center gap-2"><LayoutTemplate className="h-5 w-5 text-gold" /> Editor da Home</h2>
        <p className="text-sm text-muted-foreground">Reordena, ativa/desativa e edita as secções da página inicial.</p>
      </div>

      <div className="surface-card rounded-2xl p-4 mb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Adicionar secção</p>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button key={k} onClick={() => add(k)} className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-accent">+ {k}</button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? <p className="surface-card rounded-2xl p-10 text-center text-muted-foreground text-sm">Sem secções. Adiciona uma acima para começar.</p> :
          rows.map((s, i) => (
            <div key={s.id} className={`surface-card rounded-xl p-4 ${!s.enabled ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <button onClick={() => move(s, -1)} disabled={i === 0} className="p-0.5 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                  <button onClick={() => move(s, 1)} disabled={i === rows.length - 1} className="p-0.5 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold font-mono">{s.kind}</span>
                <Input defaultValue={s.title ?? ""} onBlur={(e) => updateField(s, "title", e.target.value)} placeholder="Título" className="flex-1 h-8 text-sm" />
                <Input defaultValue={s.subtitle ?? ""} onBlur={(e) => updateField(s, "subtitle", e.target.value)} placeholder="Subtítulo" className="flex-1 h-8 text-sm" />
                <button onClick={() => toggle(s)} className="p-1.5 rounded hover:bg-accent">{s.enabled ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}</button>
                <button onClick={() => remove(s)} className="p-1.5 rounded hover:bg-accent text-rose-400"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
