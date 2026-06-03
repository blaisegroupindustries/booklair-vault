import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/mentor10k")({
  component: Mentor10kPage,
});

interface Grant {
  id: string;
  user_id: string | null;
  email: string | null;
  source: string;
  external_order_id: string | null;
  notes: string | null;
  created_at: string;
}

function Mentor10kPage() {
  const [rows, setRows] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<Partial<Grant> | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mentor10k_access")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Grant[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!adding?.email) { toast.error("Email obrigatório"); return; }
    const { error } = await supabase.from("mentor10k_access").insert({
      email: adding.email.toLowerCase().trim(),
      source: adding.source || "manual",
      external_order_id: adding.external_order_id || null,
      notes: adding.notes || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Acesso concedido");
    setAdding(null);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Revogar acesso?")) return;
    const { error } = await supabase.from("mentor10k_access").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    void load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">Mentor 10K — Acessos</h2>
          <p className="text-sm text-muted-foreground">Quem tem acesso ao produto Mentor 10K. Adiciona por email; quando o utilizador faz login com esse email, ganha acesso automático.</p>
        </div>
        <Button variant="gold" onClick={() => setAdding({ source: "manual" })}>
          <Plus className="h-4 w-4" /> Conceder acesso
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">A carregar…</p>
      ) : rows.length === 0 ? (
        <div className="surface-card rounded-xl p-10 text-center">
          <Mail className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Ainda não foram concedidos acessos. Adiciona o primeiro email.</p>
        </div>
      ) : (
        <div className="surface-card rounded-xl divide-y divide-border/40">
          {rows.map((g) => (
            <div key={g.id} className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{g.email ?? g.user_id}</p>
                <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="px-2 py-0.5 rounded-full bg-muted/40">{g.source}</span>
                  {g.external_order_id && <span>Pedido: {g.external_order_id}</span>}
                  <span>{new Date(g.created_at).toLocaleDateString()}</span>
                </div>
                {g.notes && <p className="text-xs text-muted-foreground mt-1">{g.notes}</p>}
              </div>
              <Button variant="outline" size="sm" onClick={() => remove(g.id)}>
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!adding} onOpenChange={(o) => !o && setAdding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conceder acesso Mentor 10K</DialogTitle>
          </DialogHeader>
          {adding && (
            <div className="space-y-4">
              <div>
                <Label>Email do utilizador *</Label>
                <Input
                  type="email"
                  value={adding.email ?? ""}
                  onChange={(e) => setAdding({ ...adding, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Origem</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={adding.source ?? "manual"}
                  onChange={(e) => setAdding({ ...adding, source: e.target.value })}
                >
                  <option value="manual">Manual</option>
                  <option value="lemon_squeezy">Lemon Squeezy</option>
                  <option value="cortesia">Cortesia</option>
                </select>
              </div>
              <div>
                <Label>ID do pedido (opcional)</Label>
                <Input
                  value={adding.external_order_id ?? ""}
                  onChange={(e) => setAdding({ ...adding, external_order_id: e.target.value })}
                />
              </div>
              <div>
                <Label>Notas</Label>
                <Textarea
                  rows={3}
                  value={adding.notes ?? ""}
                  onChange={(e) => setAdding({ ...adding, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdding(null)}>Cancelar</Button>
            <Button variant="gold" onClick={save}>Conceder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
