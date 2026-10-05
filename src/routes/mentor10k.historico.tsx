import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/mentor10k/historico")({
  component: Historico,
});

interface Checkin {
  id: string;
  week_number: number;
  progress_score: number | null;
  income_eur: number | null;
  what_done: string | null;
  what_blocked: string | null;
  mentor_feedback: string | null;
  created_at: string;
}

function Historico() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [rows, setRows] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("mentor10k_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setRows((data ?? []) as Checkin[]); setLoading(false); });
  }, [user]);

  if (loading) return <p className="text-muted-foreground">{t("mentor.loading")}</p>;
  if (rows.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <History className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <p className="text-muted-foreground">{t("history.empty")}</p>
      </div>
    );
  }

  const totalIncome = rows.reduce((s, r) => s + (r.income_eur ?? 0), 0);
  const avgScore = rows.length ? (rows.reduce((s, r) => s + (r.progress_score ?? 0), 0) / rows.length).toFixed(1) : "—";

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("history.total")}</p><p className="font-serif text-3xl mt-1">{rows.length}</p></div>
        <div className="glass-card rounded-2xl p-5"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("history.average")}</p><p className="font-serif text-3xl mt-1">{avgScore}</p></div>
        <div className="glass-card rounded-2xl p-5"><p className="text-xs text-muted-foreground uppercase tracking-wider">{t("history.revenue")}</p><p className="font-serif text-3xl mt-1">€{totalIncome.toFixed(0)}</p></div>
      </div>

      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gold/15 text-gold flex items-center justify-center text-xs font-semibold">{lang === "pt" ? "S" : "W"}{r.week_number}</div>
                <div>
                  <p className="text-sm font-medium">{t("plan.week")} {r.week_number}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString(lang === "pt" ? "pt-PT" : "en-GB")}</p>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                {r.progress_score !== null && <span className="px-2 py-1 rounded-md bg-gold/10 text-gold">Score {r.progress_score}/10</span>}
                {r.income_eur !== null && <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center gap-1"><TrendingUp className="h-3 w-3" />€{r.income_eur}</span>}
              </div>
            </div>
            {r.what_done && <p className="text-sm mb-2"><span className="text-muted-foreground">{t("history.done")}:</span> {r.what_done}</p>}
            {r.what_blocked && <p className="text-sm mb-2"><span className="text-muted-foreground">{t("history.block")}:</span> {r.what_blocked}</p>}
            {r.mentor_feedback && <div className="mt-3 p-3 rounded-xl bg-gold/[0.05] border border-gold/20"><p className="text-xs text-gold mb-1 uppercase tracking-wider">Mentor</p><p className="text-sm whitespace-pre-wrap">{r.mentor_feedback}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
