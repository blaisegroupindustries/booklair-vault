import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Loader2, ClipboardList, CheckCircle2, Sparkles, Clock3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetPlan } from "@/components/ResetPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { generateMentorPlan } from "@/lib/mentor10k.functions";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/mentor10k/plano")({
  validateSearch: (s: Record<string, unknown>) => ({ generate: typeof s.generate === "string" ? s.generate : undefined }),
  head: () => ({
    meta: [
      { title: "O meu plano — CEO OS" },
      { name: "description", content: "Plano personalizado de 12 semanas, tarefas e métricas no CEO OS." },
      { property: "og:title", content: "O meu plano — CEO OS" },
      { property: "og:description", content: "Plano personalizado de 12 semanas, tarefas e métricas no CEO OS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Plano,
});

interface Plan {
  id: string;
  title: string;
  summary: string;
  phases: Array<{ name: string; weeks: string; objective: string; deliverables: string[] }>;
  weekly_tasks: Array<{ week: number; focus: string; tasks: DailyTask[] }>;
  kpis: string[];
  created_at: string;
}

interface DailyTask { day: number; label: string; outcome: string; duration_minutes: number }

type UnknownRecord = Record<string, unknown>;

function normalizePlan(input: UnknownRecord): Plan {
  const phases = Array.isArray(input.phases) ? input.phases : [];
  const weeks = Array.isArray(input.weekly_tasks) ? input.weekly_tasks : [];
  return {
    id: String(input.id ?? ""),
    title: String(input.title ?? "O teu plano CEO OS"),
    summary: String(input.summary ?? "Plano personalizado para os próximos 90 dias."),
    phases: phases.map((value) => {
      const phase = value as UnknownRecord;
      return {
        name: String(phase.name ?? phase.nome ?? "Fase"),
        weeks: String(phase.weeks ?? phase.semanas ?? ""),
        objective: String(phase.objective ?? phase.objetivo ?? ""),
        deliverables: (Array.isArray(phase.deliverables) ? phase.deliverables : Array.isArray(phase.entregas) ? phase.entregas : []).map(String),
      };
    }),
    weekly_tasks: weeks.map((value, index) => {
      const week = value as UnknownRecord;
      return {
        week: Number(week.week ?? week.semana ?? index + 1),
        focus: String(week.focus ?? week.foco ?? `Semana ${index + 1}`),
        tasks: (Array.isArray(week.tasks) ? week.tasks : Array.isArray(week.tarefas) ? week.tarefas : []).map((value, taskIndex) => {
          if (typeof value === "string") return { day: taskIndex + 1, label: value, outcome: "", duration_minutes: 0 };
          const task = value as UnknownRecord;
          return {
            day: Number(task.day ?? task.dia ?? taskIndex + 1),
            label: String(task.label ?? task.action ?? task.acao ?? task.texto ?? task.descricao ?? ""),
            outcome: String(task.outcome ?? task.resultado ?? task.deliverable ?? task.entrega ?? ""),
            duration_minutes: Number(task.duration_minutes ?? task.duracao_minutos ?? task.duration ?? 0),
          };
        }).filter((task) => task.label),
      };
    }),
    kpis: (Array.isArray(input.kpis) ? input.kpis : []).map(String),
    created_at: String(input.created_at ?? ""),
  };
}

function Plano() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const { generate } = useSearch({ from: "/mentor10k/plano" });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const attemptedDiagnostic = useRef<string | null>(null);

  const callGenerate = useServerFn(generateMentorPlan);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("mentor10k_plans")
      .select("*")
      .eq("user_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      setGenError("Não foi possível carregar o plano. Tenta novamente.");
      setPlan(null);
    } else {
      setPlan(data ? normalizePlan(data as UnknownRecord) : null);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, [user]);

  useEffect(() => {
    if (!generate || !user || attemptedDiagnostic.current === generate) return;
    attemptedDiagnostic.current = generate;
    setGenerating(true);
    setGenError(null);
    callGenerate({ data: { diagnosticId: generate, language: lang } })
      .then(() => { toast.success(lang === "pt" ? "Plano gerado!" : "Plan generated!"); void load(); })
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
        <p className="text-muted-foreground">{generating ? t("plan.generating") : t("mentor.loading")}</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h2 className="font-serif text-2xl mb-2">{genError ? t("plan.error") : t("plan.empty")}</h2>
        <p className="text-muted-foreground mb-6">
          {genError ?? t("plan.start")}
        </p>
        <Button variant="gold" asChild><Link to="/mentor10k/diagnostico">{t("plan.diagnostic")}</Link></Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="mentor-spotlight glass-card glass-sheen rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center"><Sparkles className="h-5 w-5 text-gold" /></div>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gold mb-1">{t("plan.badge")}</p>
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

      <div className="glass-card rounded-2xl p-6 md:p-8">
        <h3 className="font-serif text-3xl">{t("plan.timeline")}</h3>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">{t("plan.timeline.body")}</p>
        <div className="space-y-4">
          {plan.weekly_tasks.map((w) => (
            <section key={w.week} className="overflow-hidden rounded-2xl border border-border/50 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]">
              <div className="flex items-center gap-3 border-b border-border/40 p-4 md:px-5">
                <div className="h-9 w-9 rounded-lg bg-gold/15 text-gold text-sm font-semibold flex items-center justify-center">{w.week}</div>
                <div>
                  <p className="call-number text-gold">{t("plan.week")} {w.week}</p>
                  <p className="font-medium">{w.focus}</p>
                </div>
              </div>
              <div className="divide-y divide-border/40">
                {w.tasks.map((task, i) => (
                  <div key={`${task.day}-${i}`} className="grid gap-3 p-4 md:grid-cols-[84px_1fr_auto] md:items-start md:px-5 hover:bg-[color-mix(in_oklab,var(--gold)_5%,transparent)] transition-colors">
                    <div className="glass-pill w-fit px-3 py-1.5 text-xs font-semibold text-gold">{t("plan.day")} {task.day}</div>
                    <div>
                      <p className="text-sm font-medium leading-relaxed">{task.label}</p>
                      {task.outcome && <p className="mt-2 flex gap-2 text-xs text-muted-foreground"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" /><span><strong className="text-foreground">{t("plan.outcome")}:</strong> {task.outcome}</span></p>}
                    </div>
                    {task.duration_minutes > 0 && <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{task.duration_minutes} {t("plan.minutes")}</span>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {plan.kpis?.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="font-serif text-xl mb-3">{t("plan.metrics")}</h3>
          <div className="flex flex-wrap gap-2">
            {plan.kpis.map((k, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-gold/10 text-gold text-xs border border-gold/30">{k}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="gold" size="lg" asChild><Link to="/mentor10k/checkin">{t("plan.checkin")}</Link></Button>
      </div>
      <ResetPlan planId={plan.id} onDone={() => { setPlan(null); void load(); }} />
    </div>
  );
}
