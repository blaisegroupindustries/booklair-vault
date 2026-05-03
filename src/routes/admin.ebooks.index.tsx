import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/ebooks/")({
  component: AdminEbooksPage,
});

interface Row {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: "free" | "premium";
  status: "draft" | "scheduled" | "published" | "archived";
  published: boolean;
  featured: boolean;
  price_usd: number | null;
  created_at: string;
}

function AdminEbooksPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Row["status"]>("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("ebooks")
      .select("id, slug, title, category, type, status, published, featured, price_usd, created_at")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const togglePublished = async (r: Row) => {
    const next = !r.published;
    const { error } = await supabase
      .from("ebooks")
      .update({
        published: next,
        status: next ? "published" : "draft",
        published_at: next ? new Date().toISOString() : null,
      })
      .eq("id", r.id);
    if (error) toast.error(error.message);
    else { toast.success(next ? "Publicado" : "Despublicado"); load(); }
  };

  const toggleFeatured = async (r: Row) => {
    const { error } = await supabase.from("ebooks").update({ featured: !r.featured }).eq("id", r.id);
    if (error) toast.error(error.message);
    else load();
  };

  const remove = async (r: Row) => {
    if (!confirm(`Eliminar "${r.title}"? Esta ação é irreversível.`)) return;
    const { error } = await supabase.from("ebooks").delete().eq("id", r.id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); load(); }
  };

  const filtered = rows.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl">Ebooks</h2>
          <p className="text-sm text-muted-foreground">Gere o catálogo completo da livraria.</p>
        </div>
        <Button variant="gold" asChild>
          <Link to="/admin/ebooks/novo"><Plus className="h-4 w-4" /> Novo ebook</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar título…" className="pl-9" />
        </div>
        <div className="flex gap-1">
          {(["all", "draft", "scheduled", "published", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                statusFilter === s ? "bg-gold/10 text-gold border-gold/40" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "Todos" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">A carregar…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-muted-foreground mb-4">Sem ebooks ainda.</p>
            <Button variant="gold" asChild><Link to="/admin/ebooks/novo">Criar o primeiro</Link></Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Título</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Estado</th>
                  <th className="text-right p-3">Preço</th>
                  <th className="text-right p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-border/50 hover:bg-accent/30">
                    <td className="p-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-xs text-muted-foreground">/{r.slug}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{r.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full ${r.type === "premium" ? "bg-gold/15 text-gold" : "bg-secondary"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] rounded-full ${
                        r.status === "published" ? "bg-emerald-500/15 text-emerald-400" :
                        r.status === "draft" ? "bg-muted text-muted-foreground" :
                        r.status === "scheduled" ? "bg-blue-500/15 text-blue-400" :
                        "bg-rose-500/15 text-rose-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">{r.price_usd ? `$${Number(r.price_usd).toFixed(2)}` : "—"}</td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button title={r.featured ? "Remover destaque" : "Destacar"} onClick={() => toggleFeatured(r)} className="p-1.5 rounded hover:bg-accent">
                          <Star className={`h-4 w-4 ${r.featured ? "text-gold fill-gold" : "text-muted-foreground"}`} />
                        </button>
                        <button title={r.published ? "Despublicar" : "Publicar"} onClick={() => togglePublished(r)} className="p-1.5 rounded hover:bg-accent">
                          {r.published ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                        </button>
                        <Link to="/admin/ebooks/$id" params={{ id: r.id }} className="p-1.5 rounded hover:bg-accent">
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button onClick={() => remove(r)} className="p-1.5 rounded hover:bg-accent text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
