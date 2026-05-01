import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/compras")({
  component: ComprasPage,
});

interface Purchase {
  id: string;
  user_id: string;
  ebook_id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created_at: string;
}

function ComprasPage() {
  const [rows, setRows] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("purchases").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setRows((data ?? []) as Purchase[]);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <h2 className="font-serif text-2xl mb-1">Compras</h2>
      <p className="text-sm text-muted-foreground mb-6">Histórico de compras premium.</p>

      <div className="surface-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground text-sm">A carregar…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            Sem compras ainda. Quando os pagamentos estiverem ativos, aparecem aqui.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Utilizador</th>
                <th className="text-left p-3">Ebook</th>
                <th className="text-left p-3">Valor</th>
                <th className="text-left p-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/50">
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString("pt-PT")}</td>
                  <td className="p-3 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                  <td className="p-3 font-mono text-xs">{r.ebook_id.slice(0, 8)}…</td>
                  <td className="p-3">{r.currency} {Number(r.amount_paid).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full ${r.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-muted text-muted-foreground"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
