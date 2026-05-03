import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/campanhas")({
  component: CampaignsPage,
});

interface Campaign { id: string; name: string; subject: string; body_html: string | null; segment: string; status: string; recipients_count: number; opens_count: number; clicks_count: number; created_at: string; sent_at: string | null; }

function CampaignsPage() {
  const [rows, setRows] = useState<Campaign[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", body_html: "", segment: "all" });

  const load = async () => {
    const { data } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Campaign[]);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.name || !form.subject) { toast.error("Nome e assunto obrigatórios"); return; }
    const { error } = await supabase.from("email_campaigns").insert(form);
    if (error) toast.error(error.message); else { toast.success("Rascunho criado"); setOpen(false); setForm({ name: "", subject: "", body_html: "", segment: "all" }); load(); }
  };

  const remove = async (c: Campaign) => {
    if (!confirm("Eliminar?")) return;
    const { error } = await supabase.from("email_campaigns").delete().eq("id", c.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl flex items-center gap-2"><Mail className="h-5 w-5 text-gold" /> Email Campaigns</h2>
          <p className="text-sm text-muted-foreground">Cria, agenda e acompanha envios de email.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> Nova campanha</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Nova campanha</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs uppercase">Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label className="text-xs uppercase">Assunto</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
              <div><Label className="text-xs uppercase">Segmento</Label>
                <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })}>
                  <option value="all">Todos os utilizadores</option>
                  <option value="customers">Compradores</option>
                  <option value="non_customers">Sem compras</option>
                  <option value="newsletter">Inscritos newsletter</option>
                </select>
              </div>
              <div><Label className="text-xs uppercase">HTML do email</Label><Textarea rows={8} value={form.body_html} onChange={(e) => setForm({ ...form, body_html: e.target.value })} placeholder="<h1>Olá!</h1>…" /></div>
              <p className="text-xs text-muted-foreground">⚠️ Envio real requer ligação a um provider de email. Por agora guardamos como rascunho.</p>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={submit} variant="gold">Guardar rascunho</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="surface-card rounded-2xl overflow-hidden">
        {rows.length === 0 ? <div className="p-10 text-center text-muted-foreground">Sem campanhas.</div> :
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground"><tr>
            <th className="text-left p-3">Nome</th><th className="text-left p-3">Estado</th>
            <th className="text-left p-3">Segmento</th><th className="text-left p-3">Métricas</th><th className="text-right p-3">Ações</th>
          </tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-t border-border/50">
                <td className="p-3"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.subject}</p></td>
                <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">{c.status}</span></td>
                <td className="p-3 text-muted-foreground">{c.segment}</td>
                <td className="p-3 text-xs">{c.recipients_count} env · {c.opens_count} ab · {c.clicks_count} cli</td>
                <td className="p-3 text-right">
                  <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-accent text-rose-400"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
