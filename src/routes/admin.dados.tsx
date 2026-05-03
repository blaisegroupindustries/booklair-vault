import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Database, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dados")({
  component: DataPage,
});

const TABLES = [
  { id: "ebooks", label: "Ebooks" },
  { id: "profiles", label: "Utilizadores (profiles)" },
  { id: "purchases", label: "Compras" },
  { id: "downloads", label: "Downloads" },
  { id: "ebook_reviews", label: "Reviews" },
  { id: "coupons", label: "Cupões" },
  { id: "activity_log", label: "Log de atividade" },
] as const;

function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function DataPage() {
  const [busy, setBusy] = useState<string | null>(null);

  const exportTable = async (t: string) => {
    setBusy(t);
    const { data, error } = await supabase.from(t as never).select("*");
    setBusy(null);
    if (error) { toast.error(error.message); return; }
    const csv = toCsv(data ?? []);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${t}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exportado: ${data?.length ?? 0} linhas`);
  };

  const exportAll = async () => {
    setBusy("ALL");
    const out: Record<string, unknown[]> = {};
    for (const t of TABLES) {
      const { data } = await supabase.from(t.id as never).select("*");
      out[t.id] = data ?? [];
    }
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `booklair-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setBusy(null);
    toast.success("Backup completo");
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl flex items-center gap-2"><Database className="h-5 w-5 text-gold" /> Export / Import & Backup</h2>
        <p className="text-sm text-muted-foreground">Descarrega cópias dos teus dados a qualquer momento.</p>
      </div>

      <div className="surface-card rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Backup completo (JSON)</h3>
            <p className="text-xs text-muted-foreground">Inclui todas as tabelas relevantes num só ficheiro.</p>
          </div>
          <Button variant="gold" onClick={exportAll} disabled={busy !== null}><Download className="h-4 w-4" /> {busy === "ALL" ? "A gerar…" : "Backup"}</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {TABLES.map((t) => (
          <div key={t.id} className="surface-card rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground font-mono">{t.id}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => exportTable(t.id)} disabled={busy === t.id}>
              <Download className="h-4 w-4" /> {busy === t.id ? "…" : "CSV"}
            </Button>
          </div>
        ))}
      </div>

      <div className="surface-card rounded-2xl p-5 mt-6 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <Upload className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <p className="font-semibold">Import em massa (em breve)</p>
            <p className="text-xs text-muted-foreground">Em breve poderás carregar CSVs para criar dezenas de ebooks de uma só vez.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
