import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MessageSquare, Eye, EyeOff, Trash2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsPage,
});

interface R { id: string; ebook_id: string; user_id: string; rating: number; title: string | null; body: string | null; approved: boolean; hidden: boolean; created_at: string; }

function ReviewsPage() {
  const [rows, setRows] = useState<R[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "pending" | "hidden">("all");

  const load = async () => {
    const { data } = await supabase.from("ebook_reviews").select("*").order("created_at", { ascending: false });
    setRows((data ?? []) as R[]);
    const ids = Array.from(new Set((data ?? []).map((r) => r.ebook_id)));
    if (ids.length) {
      const { data: e } = await supabase.from("ebooks").select("id, title").in("id", ids);
      setTitles(Object.fromEntries((e ?? []).map((x) => [x.id, x.title])));
    }
  };
  useEffect(() => { load(); }, []);

  const toggleHide = async (r: R) => {
    await supabase.from("ebook_reviews").update({ hidden: !r.hidden }).eq("id", r.id); load();
  };
  const toggleApprove = async (r: R) => {
    await supabase.from("ebook_reviews").update({ approved: !r.approved }).eq("id", r.id); load();
  };
  const remove = async (r: R) => {
    if (!confirm("Eliminar review?")) return;
    await supabase.from("ebook_reviews").delete().eq("id", r.id); load();
  };

  const filtered = rows.filter((r) => filter === "pending" ? !r.approved : filter === "hidden" ? r.hidden : true);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl flex items-center gap-2"><MessageSquare className="h-5 w-5 text-gold" /> Reviews</h2>
        <p className="text-sm text-muted-foreground">Modera comentários e classificações.</p>
      </div>
      <div className="flex gap-1 mb-4">
        {(["all", "pending", "hidden"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-md border ${filter === s ? "bg-gold/10 text-gold border-gold/40" : "border-border text-muted-foreground"}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? <p className="surface-card rounded-2xl p-10 text-center text-muted-foreground text-sm">Sem reviews.</p> :
          filtered.map((r) => (
            <div key={r.id} className="surface-card rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />)}</div>
                    <p className="text-sm font-medium">{r.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{titles[r.ebook_id] ?? r.ebook_id}</p>
                  <p className="text-sm mt-2">{r.body}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.approved ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>{r.approved ? "OK" : "PENDING"}</span>
                  {r.hidden && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">HIDDEN</span>}
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => toggleApprove(r)} className="p-1.5 rounded hover:bg-accent" title={r.approved ? "Reprovar" : "Aprovar"}>{r.approved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4 text-emerald-400" />}</button>
                    <button onClick={() => toggleHide(r)} className="p-1.5 rounded hover:bg-accent" title="Esconder">{r.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => remove(r)} className="p-1.5 rounded hover:bg-accent text-rose-400"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
