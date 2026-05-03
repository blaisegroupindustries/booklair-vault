import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/popups")({
  component: PopupsPage,
});

interface Popup {
  id: string; name: string; enabled: boolean;
  title: string | null; body: string | null;
  cta_text: string | null; cta_link: string | null; image_url: string | null;
  trigger: "immediate" | "delay" | "scroll" | "exit_intent";
  trigger_value: number;
  target: "all" | "guests" | "authenticated";
  show_on_paths: string[];
  starts_at: string | null; ends_at: string | null;
  views_count: number; clicks_count: number;
}

const EMPTY = {
  name: "", enabled: false, title: "", body: "", cta_text: "", cta_link: "", image_url: "",
  trigger: "delay" as const, trigger_value: 5,
  target: "all" as const, show_on_paths: "" as string,
  starts_at: "", ends_at: "",
};

function PopupsPage() {
  const [rows, setRows] = useState<Popup[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Popup | null>(null);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    const { data } = await supabase.from("popups").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Popup[]);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(EMPTY); setEditing(null); };
  const startEdit = (p: Popup) => {
    setEditing(p);
    setForm({
      name: p.name, enabled: p.enabled,
      title: p.title ?? "", body: p.body ?? "",
      cta_text: p.cta_text ?? "", cta_link: p.cta_link ?? "", image_url: p.image_url ?? "",
      trigger: p.trigger, trigger_value: p.trigger_value, target: p.target,
      show_on_paths: (p.show_on_paths ?? []).join(", "),
      starts_at: p.starts_at?.slice(0, 16) ?? "", ends_at: p.ends_at?.slice(0, 16) ?? "",
    });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name, enabled: form.enabled,
      title: form.title || null, body: form.body || null,
      cta_text: form.cta_text || null, cta_link: form.cta_link || null, image_url: form.image_url || null,
      trigger: form.trigger, trigger_value: Number(form.trigger_value), target: form.target,
      show_on_paths: form.show_on_paths.split(",").map((s) => s.trim()).filter(Boolean),
      starts_at: form.starts_at || null, ends_at: form.ends_at || null,
    };
    const res = editing ? await supabase.from("popups").update(payload).eq("id", editing.id) : await supabase.from("popups").insert(payload);
    if (res.error) toast.error(res.error.message); else { toast.success("Guardado"); setOpen(false); reset(); load(); }
  };

  const remove = async (p: Popup) => {
    if (!confirm("Eliminar?")) return;
    const { error } = await supabase.from("popups").delete().eq("id", p.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl flex items-center gap-2"><Bell className="h-5 w-5 text-gold" /> Popups & Banners</h2>
          <p className="text-sm text-muted-foreground">Mensagens dirigidas com triggers e segmentação.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> Novo popup</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} popup</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid md:grid-cols-[1fr_auto] gap-3 items-end">
                <div><Label className="text-xs uppercase">Nome interno *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="flex items-center gap-2"><Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} /><Label>Ativo</Label></div>
              </div>
              <div><Label className="text-xs uppercase">Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label className="text-xs uppercase">Mensagem</Label><Textarea rows={3} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label className="text-xs uppercase">CTA texto</Label><Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} /></div>
                <div><Label className="text-xs uppercase">CTA link</Label><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs uppercase">URL da imagem</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label className="text-xs uppercase">Trigger</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value as Popup["trigger"] })}>
                    <option value="immediate">Imediato</option>
                    <option value="delay">Após X segundos</option>
                    <option value="scroll">Após X% scroll</option>
                    <option value="exit_intent">Exit intent</option>
                  </select>
                </div>
                <div><Label className="text-xs uppercase">Valor (s ou %)</Label><Input type="number" value={form.trigger_value} onChange={(e) => setForm({ ...form, trigger_value: Number(e.target.value) })} /></div>
                <div><Label className="text-xs uppercase">Audiência</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value as Popup["target"] })}>
                    <option value="all">Todos</option>
                    <option value="guests">Visitantes</option>
                    <option value="authenticated">Logados</option>
                  </select>
                </div>
              </div>
              <div><Label className="text-xs uppercase">Mostrar nas rotas (vírgula, vazio = todas)</Label><Input value={form.show_on_paths} onChange={(e) => setForm({ ...form, show_on_paths: e.target.value })} placeholder="/, /loja, /biblioteca" /></div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label className="text-xs uppercase">Início</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
                <div><Label className="text-xs uppercase">Fim</Label><Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" variant="gold">Guardar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {rows.length === 0 ? <p className="text-muted-foreground text-sm md:col-span-2 surface-card p-10 rounded-2xl text-center">Sem popups configurados.</p> :
          rows.map((p) => (
            <div key={p.id} className="surface-card rounded-xl p-4 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.title}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{p.enabled ? "ATIVO" : "OFF"}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{p.body}</p>
              <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                <span>{p.views_count} vistas · {p.clicks_count} cliques</span>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(p)} className="p-1.5 rounded hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => remove(p)} className="p-1.5 rounded hover:bg-accent text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
