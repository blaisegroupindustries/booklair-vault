import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Target, ClipboardList, TrendingUp, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/mentor10k/")({
  component: Dashboard,
});

interface Stat { plans: number; checkins: number; last_score: number | null; last_income: number | null; }

function Dashboard() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stat>({ plans: 0, checkins: 0, last_score: null, last_income: null });
  const [hasDiagnostic, setHasDiagnostic] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      const [{ count: p }, { count: c }, { data: lastCheckin }, { data: diag }, { data: plan }] = await Promise.all([
        supabase.from("mentor10k_plans").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("mentor10k_checkins").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("mentor10k_checkins").select("progress_score, income_eur").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("mentor10k_diagnostics").select("id").eq("user_id", user.id).limit(1).maybeSingle(),
        supabase.from("mentor10k_plans").select("id").eq("user_id", user.id).limit(1).maybeSingle(),
      ]);
      setStats({ plans: p ?? 0, checkins: c ?? 0, last_score: lastCheckin?.progress_score ?? null, last_income: lastCheckin?.income_eur ?? null });
      setHasDiagnostic(!!diag);
      setHasPlan(!!plan);
    })();
  }, [user]);

  const steps = [
    { done: hasDiagnostic, label: t("dashboard.step.diagnostic"), to: "/mentor10k/diagnostico", icon: Target },
    { done: hasPlan, label: t("dashboard.step.plan"), to: "/mentor10k/plano", icon: ClipboardList },
    { done: stats.checkins > 0, label: t("dashboard.step.checkin"), to: "/mentor10k/checkin", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t("dashboard.plans")} value={String(stats.plans)} icon={ClipboardList} />
        <StatCard label={t("dashboard.checkins")} value={String(stats.checkins)} icon={TrendingUp} />
        <StatCard label={t("dashboard.score")} value={stats.last_score !== null ? `${stats.last_score}/10` : "—"} icon={Sparkles} />
        <StatCard label={t("dashboard.income")} value={stats.last_income !== null ? `€${stats.last_income}` : "—"} icon={TrendingUp} />
      </div>

      <div className="mentor-spotlight glass-card glass-sheen rounded-2xl p-6">
        <h2 className="font-serif text-2xl mb-1">{t("dashboard.next")}</h2>
        <p className="text-sm text-muted-foreground mb-5">{t("dashboard.sequence")}</p>
        <div className="space-y-2">
          {steps.map((s, i) => (
            <Link key={s.to} to={s.to} className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${s.done ? "border-gold/30 bg-gold/[0.04]" : "border-border/40 bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)] hover:bg-[color-mix(in_oklab,var(--foreground)_7%,transparent)]"}`}>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${s.done ? "bg-gold/20 text-gold glow-gold" : "bg-muted/30 text-muted-foreground"}`}>
                {s.done ? "✓" : i + 1}
              </div>
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 font-medium">{s.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-gold/15 flex items-center justify-center">
          <MessageSquare className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{t("dashboard.chat.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("dashboard.chat.body")}</p>
        </div>
        <Button variant="gold" asChild>
          <Link to="/mentor10k/chat">{t("dashboard.open")} <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-gold/70" />
      </div>
      <p className="font-serif text-3xl">{value}</p>
    </div>
  );
}
