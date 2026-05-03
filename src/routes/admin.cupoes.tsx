import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, Tag, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/cupoes")({
  component: CouponsPage,
});

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  scope: "all" | "ebook" | "category";
  scope_ebook_id: string | null;
  scope_category: string | null;
  max_uses: number | null;
  used_count: number;
  min_order_usd: number | null;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

const EMPTY = {
  code: "", description: "", discount_type: "percent" as const, discount_value: 10,
  scope: "all" as const, max_uses: "", min_order_usd: "",
  starts_at: "", expires_at: "", active: true,
};

function CouponsPage() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Coupon[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const reset = () => { setForm(EMPTY); setEditing(null); };

  const startEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      description: c.description ?? "",
      discount_type: c.discount_type,
      discount_value: Number(c.discount_value),
      scope: c.scope,
      max_uses: c.max_uses?.toString() ?? "",
      min_order_usd: c.min_order_usd?.toString() ?? "",
      starts_at: c.starts_at?.slice(0, 16) ?? "",
      expires_at: c.expires_at?.slice(0, 16) ?? "",
      active: c.active,
    });
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      scope: form.scope,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      min_order_usd: form.min_order_usd ? Number(form.min_order_usd) : null,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      active: form.active,
    };
    const res = editing
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success(editing ? "Atualizado" : "Cupão criado");
    setOpen(false); reset(); load();
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`Eliminar cupão ${c.code}?`)) return;
    const { error } = await supabase.from("coupons").delete().eq("id", c.id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); load(); }
  };

  const toggle = async (c: Coupon) => {
    const { error } = await supabase.from("coupons").update({ active: !c.active }).eq("id", c.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl flex items-center gap-2"><Tag className="h-5 w-5 text-gold" /> Cupões</h2>
          <p className="text-sm text-muted-foreground">Códigos promocionais com regras flexíveis.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild>
            <Button variant="gold"><Plus className="h-4 w-4" /> Novo cupão</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} cupão</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label className="text-xs uppercase">Código *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="VERAO25" required /></div>
                <div><Label className="text-xs uppercase">Descrição</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label className="text-xs uppercase">Tipo</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })}>
                    <option value="percent">Percentagem (%)</option>
                    <option value="fixed">Valor fixo (USD)</option>
                  </select>
                </div>
                <div><Label className="text-xs uppercase">Valor *</Label><Input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} required /></div>
                <div><Label className="text-xs uppercase">Aplica-se a</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as "all" | "ebook" | "category" })}>
                    <option value="all">Toda a loja</option>
                    <option value="ebook">Ebook específico</option>
                    <option value="category">Categoria</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label className="text-xs uppercase">Limite de usos</Label><Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="ilimitado" /></div>
                <div><Label className="text-xs uppercase">Compra mínima (USD)</Label><Input type="number" step="0.01" value={form.min_order_usd} onChange={(e) => setForm({ ...form, min_order_usd: e.target.value })} /></div>
                <div className="flex items-end gap-2"><Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /><Label>Ativo</Label></div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label className="text-xs uppercase">Início</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} /></div>
                <div><Label className="text-xs uppercase">Expira</Label><Input type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" variant="gold">Guardar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="surface-card rounded-2xl overflow-hidden">
        {loading ? <div className="p-10 text-center text-muted-foreground">A carregar…</div> :
        rows.length === 0 ? <div className="p-10 text-center text-muted-foreground">Sem cupões ainda.</div> :
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><tr>
              <th className="text-left p-3">Código</th><th className="text-left p-3">Desconto</th>
              <th className="text-left p-3">Âmbito</th><th className="text-left p-3">Usos</th>
              <th className="text-left p-3">Validade</th><th className="text-right p-3">Ações</th>
            </tr></thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-border/50 hover:bg-accent/30">
                  <td className="p-3 font-mono font-semibold flex items-center gap-2">
                    {c.code}
                    <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Copiado"); }} className="text-muted-foreground hover:text-gold"><Copy className="h-3 w-3" /></button>
                  </td>
                  <td className="p-3">{c.discount_type === "percent" ? `${c.discount_value}%` : `$${Number(c.discount_value).toFixed(2)}`}</td>
                  <td className="p-3 text-muted-foreground">{c.scope}</td>
                  <td className="p-3">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("pt-PT") : "—"}</td>
                  <td className="p-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => toggle(c)} className={`px-2 py-1 text-[10px] rounded ${c.active ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>{c.active ? "ATIVO" : "OFF"}</button>
                      <button onClick={() => startEdit(c)} className="p-1.5 rounded hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-accent text-rose-400"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>}
      </div>
    </div>
  );
}
