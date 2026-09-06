import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Loader2, ClipboardList, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateMentorPlan } from "@/lib/mentor10k.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/mentor10k/plano")({
  validateSearch: (s: Record<string, unknown>) => ({ generate: typeof s.generate === "string" ? s.generate : undefined }),
  component: Plano,
});

interface Plan {
  id: string;
  title: string;
  summary: string;
  phases: Array<{ name: string; weeks: string; objective: string; deliverables: string[] }>;
  weekly_tasks: Array<{ week: number; focus: string; tasks: string[] }>;
  kpis: string[];
  created_at: string;
}

function Plano() {
  const { user } = useAuth();
  const { generate } = useSearch({ from: "/mentor10k/plano" });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const callGenerate = useServerFn(generateMentorPlan);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("mentor10k_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setPlan(data as Plan | null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [user]);

  useEffect(() => {
    if (!generate || !user || generating) return;
    setGenerating(true);
    setGenError(null);
    callGenerate({ data: { diagnosticId: generate } })
      .then(() => { toast.success("Plano gerado!"); void load(); })
      .catch((e) => {
        const msg = e?.message ?? "Erro ao gerar plano";
        setGenError(msg);
        toast.error(msg);
      })
      .finally(() => setGenerating(false));
  }, [generate, user]);

  if (loading || generating) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold mx-auto mb-3" />
        <p className="text-muted-foreground">{generating ? "O Mentor está a desenhar o teu plano…" : "A carregar…"}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl mb-2">{genError ? "Não deu para gerar o plano" : "Ainda sem plano"}</h2>
        <p className="text-muted-foreground mb-6">
          {genError ?? "Começa pelo diagnóstico — geramos um plano de 12 semanas à tua medida."}
        </p>
        <Button variant="gold" asChild><Link to="/mentor10k/diagnostico">Fazer diagnóstico</Link></Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center"><Sparkles className="h-5 w-5 text-gold" /></div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gold mb-1">Plano 12 semanas</p>
            <h2 className="font-serif text-3xl">{plan.title}</h2>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">{plan.summary}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plan.phases.map((p) => (
          <div key={p.name} className="glass-card rounded-2xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-gold">{p.weeks}</p>
            <h3 className="font-serif text-xl mt-1 mb-2">{p.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{p.objective}</p>
            <ul className="space-y-1.5">
              {p.deliverables.map((d, i) => (
                <li key={i} className="flex gap-2 text-xs"><CheckCircle2 className="h-3 w-3 text-gold/70 mt-0.5 shrink-0" /><span>{d}</span></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-serif text-2xl mb-4">Semana a semana</h3>
        <div className="space-y-3">
          {plan.weekly_tasks.map((w) => (
            <div key={w.week} className="rounded-xl border border-border/40 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-7 w-7 rounded-md bg-gold/15 text-gold text-xs font-semibold flex items-center justify-center">{w.week}</div>
                <p className="font-medium">{w.focus}</p>
              </div>
              <ul className="ml-10 space-y-1 text-sm text-muted-foreground">
                {w.tasks.map((t, i) => <li key={i}>• {t}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {plan.kpis?.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-serif text-xl mb-3">Métricas a acompanhar</h3>
          <div className="flex flex-wrap gap-2">
            {plan.kpis.map((k, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-xs border border-gold/30">{k}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="gold" size="lg" asChild><Link to="/mentor10k/checkin">Fazer check-in semanal</Link></Button>
        <Button variant="outline" size="lg" asChild><Link to="/mentor10k/diagnostico">Refazer diagnóstico</Link></Button>
      </div>
    </div>
  );
}
