import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { slugify } from "@/lib/ebook-helpers";

export const Route = createFileRoute("/admin/colecoes")({
  component: CollectionsPage,
});

interface Col { id: string; slug: string; title: string; description: string | null; type: "series" | "bundle" | "curated"; cover_url: string | null; bundle_price_usd: number | null; bundle_price_mzn: number | null; published: boolean; featured: boolean; }

const EMPTY = { slug: "", title: "", description: "", type: "curated" as const, cover_url: "", bundle_price_usd: "", bundle_price_mzn: "", published: false, featured: false };

function CollectionsPage() {
  const [rows, setRows] = useState<Col[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Col | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [items, setItems] = useState<{ id: string; ebook_id: string }[]>([]);
  const [ebooks, setEbooks] = useState<{ id: string; title: string }[]>([]);
  const [pickEbook, setPickEbook] = useState("");

  const load = async () => {
    const { data } = await supabase.from("ebook_collections").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as Col[]);
  };
  useEffect(() => { load(); supabase.from("ebooks").select("id, title").then(({ data }) => setEbooks(data ?? [])); }, []);

  const reset = () => { setForm(EMPTY); setEditing(null); setItems([]); };

  const startEdit = async (c: Col) => {
    setEditing(c);
    setForm({ slug: c.slug, title: c.title, description: c.description ?? "", type: c.type, cover_url: c.cover_url ?? "", bundle_price_usd: c.bundle_price_usd?.toString() ?? "", bundle_price_mzn: c.bundle_price_mzn?.toString() ?? "", published: c.published, featured: c.featured });
    const { data } = await supabase.from("collection_items").select("id, ebook_id").eq("collection_id", c.id);
    setItems(data ?? []);
    setOpen(true);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || slugify(form.title), bundle_price_usd: form.bundle_price_usd ? Number(form.bundle_price_usd) : null, bundle_price_mzn: form.bundle_price_mzn ? Number(form.bundle_price_mzn) : null, description: form.description || null, cover_url: form.cover_url || null };
    const res = editing ? await supabase.from("ebook_collections").update(payload).eq("id", editing.id).select().single() : await supabase.from("ebook_collections").insert(payload).select().single();
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Guardado"); setOpen(false); reset(); load();
  };

  const addItem = async () => {
    if (!editing || !pickEbook) return;
    const { error } = await supabase.from("collection_items").insert({ collection_id: editing.id, ebook_id: pickEbook });
    if (error) toast.error(error.message); else {
      const { data } = await supabase.from("collection_items").select("id, ebook_id").eq("collection_id", editing.id);
      setItems(data ?? []); setPickEbook("");
    }
  };

  const removeItem = async (id: string) => {
    await supabase.from("collection_items").delete().eq("id", id);
    setItems((it) => it.filter((i) => i.id !== id));
  };

  const remove = async (c: Col) => {
    if (!confirm("Eliminar?")) return;
    const { error } = await supabase.from("ebook_collections").delete().eq("id", c.id);
    if (error) toast.error(error.message); else load();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl flex items-center gap-2"><FolderTree className="h-5 w-5 text-gold" /> Coleções & Bundles</h2>
          <p className="text-sm text-muted-foreground">Agrupa ebooks em séries, bundles ou listas curadas.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
          <DialogTrigger asChild><Button variant="gold"><Plus className="h-4 w-4" /> Nova coleção</Button></DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Nova"} coleção</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div><Label className="text-xs uppercase">Título *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
                <div><Label className="text-xs uppercase">Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="auto" /></div>
              </div>
              <div><Label className="text-xs uppercase">Descrição</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label className="text-xs uppercase">Tipo</Label>
                  <select className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Col["type"] })}>
                    <option value="curated">Curada</option><option value="series">Série</option><option value="bundle">Bundle</option>
                  </select>
                </div>
                <div><Label className="text-xs uppercase">Preço bundle USD</Label><Input type="number" step="0.01" value={form.bundle_price_usd} onChange={(e) => setForm({ ...form, bundle_price_usd: e.target.value })} /></div>
                <div><Label className="text-xs uppercase">Preço bundle MZN</Label><Input type="number" value={form.bundle_price_mzn} onChange={(e) => setForm({ ...form, bundle_price_mzn: e.target.value })} /></div>
              </div>
              <div><Label className="text-xs uppercase">URL da capa</Label><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /> Publicado</label>
                <label className="flex items-center gap-2 text-sm"><Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} /> Destacado</label>
              </div>

              {editing && (
                <div className="border-t border-border/50 pt-3">
                  <Label className="text-xs uppercase">Ebooks na coleção</Label>
                  <div className="flex gap-2 mt-2">
                    <select className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={pickEbook} onChange={(e) => setPickEbook(e.target.value)}>
                      <option value="">Escolher ebook…</option>
                      {ebooks.filter((e) => !items.find((i) => i.ebook_id === e.id)).map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                    <Button type="button" onClick={addItem}>Adicionar</Button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {items.map((i) => (
                      <li key={i.id} className="flex items-center justify-between text-sm bg-muted/30 rounded px-3 py-1.5">
                        <span>{ebooks.find((e) => e.id === i.ebook_id)?.title ?? i.ebook_id}</span>
                        <button type="button" onClick={() => removeItem(i.id)} className="text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" variant="gold">Guardar</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.length === 0 ? <p className="text-muted-foreground text-sm md:col-span-3 surface-card p-10 rounded-2xl text-center">Sem coleções ainda.</p> :
          rows.map((c) => (
            <div key={c.id} className="surface-card rounded-xl p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{c.title}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold">{c.type}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">/{c.slug}</p>
              {c.bundle_price_usd && <p className="text-sm mt-2">Bundle: ${Number(c.bundle_price_usd).toFixed(2)}</p>}
              <div className="flex gap-1 mt-3">
                <button onClick={() => startEdit(c)} className="p-1.5 rounded hover:bg-accent"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => remove(c)} className="p-1.5 rounded hover:bg-accent text-rose-400"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
