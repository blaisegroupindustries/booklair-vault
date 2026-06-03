import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Copy, Trash2, Pencil, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/afiliados")({
  component: AfiliadosPage,
});

interface Affiliate {
  id: string;
  name: string;
  email: string | null;
  code: string;
  commission_percent: number;
  active: boolean;
  notes: string | null;
  total_clicks: number;
  total_conversions: number;
  total_revenue_usd: number;
  created_at: string;
}

const slugCode = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 24);

function AfiliadosPage() {
  const [rows, setRows] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Affiliate> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("affiliates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Affiliate[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing?.code) {
      toast.error("Nome e código obrigatórios");
      return;
    }
    const payload = {
      name: editing.name,
      email: editing.email || null,
      code: slugCode(editing.code),
      commission_percent: editing.commission_percent ?? 20,
      active: editing.active ?? true,
      notes: editing.notes || null,
    };
    const res = editing.id
      ? await supabase.from("affiliates").update(payload).eq("id", editing.id)
      : await supabase.from("affiliates").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing.id ? "Atualizado" : "Afiliado criado");
    setEditing(null);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este afiliado?")) return;
    const { error } = await supabase.from("affiliates").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    void load();
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Afiliados</h2>
          <p className="text-sm text-muted-foreground">Cria links únicos por afiliado e acompanha cliques e conversões.</p>
        </div>
        <Button variant="gold" onClick={() => setEditing({ commission_percent: 20, active: true })}>
          <Plus className="h-4 w-4" /> Novo afiliado
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">A carregar…</p>
      ) : rows.length === 0 ? (
        <div className="surface-card rounded-xl p-10 text-center">
          <p className="text-muted-foreground">Ainda sem afiliados. Cria o primeiro para gerar um link único.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {rows.map((a) => {
            const link = `${origin}/?ref=${a.code}`;
            return (
              <div key={a.id} className="surface-card rounded-xl p-4 grid md:grid-cols-[1fr_auto] gap-4 items-center">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif text-lg">{a.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${a.active ? "bg-emerald-500/15 text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                      {a.active ? "Ativo" : "Inativo"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30">
                      {a.commission_percent}% comissão
                    </span>
                  </div>
                  {a.email && <p className="text-xs text-muted-foreground mt-0.5">{a.email}</p>}
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <code className="px-2 py-1 rounded bg-muted/40 font-mono truncate flex-1">{link}</code>
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(link); toast.success("Link copiado"); }}
                      className="text-muted-foreground hover:text-gold"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <a href={link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-gold">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>{a.total_clicks} cliques</span>
                    <span>{a.total_conversions} conversões</span>
                    <span>${Number(a.total_revenue_usd).toFixed(2)} receita</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => remove(a.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar afiliado" : "Novo afiliado"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={editing.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value, code: editing.code || slugCode(e.target.value) })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editing.email ?? ""}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Código (no URL) *</Label>
                  <Input
                    value={editing.code ?? ""}
                    onChange={(e) => setEditing({ ...editing, code: slugCode(e.target.value) })}
                    placeholder="joao-silva"
                  />
                </div>
                <div>
                  <Label>Comissão (%)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={editing.commission_percent ?? 20}
                    onChange={(e) => setEditing({ ...editing, commission_percent: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Notas internas</Label>
                <Textarea
                  rows={3}
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={editing.active ?? true}
                  onCheckedChange={(v) => setEditing({ ...editing, active: v })}
                /> Ativo
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button variant="gold" onClick={save}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
