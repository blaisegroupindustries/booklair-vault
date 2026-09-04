import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Target, ClipboardList, Activity, MessageSquare, History, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mentor10kBuyButton } from "@/components/Mentor10kBuyButton";


export const Route = createFileRoute("/mentor10k")({
  head: () => ({ meta: [{ title: "Mentor 10K — Booklair" }] }),
  component: Mentor10kLayout,
});

function Mentor10kLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: "/mentor10k" } as never });
      return;
    }
    if (!user) return;
    void supabase
      .rpc("has_mentor10k_access", { _user_id: user.id })
      .then(({ data }) => setHasAccess(!!data));
  }, [user, loading, navigate]);

  if (loading || hasAccess === null) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">A carregar…</div>;
  }

  // Áreas gratuitas: diagnóstico, plano e primeiras conversas com o mentor.
  const freePaths = ["/mentor10k", "/mentor10k/diagnostico", "/mentor10k/plano", "/mentor10k/chat"];
  const locked = !hasAccess && !freePaths.includes(pathname);

  const tabs: Array<{ to: string; label: string; icon: typeof Sparkles; exact?: boolean; pro?: boolean }> = [
    { to: "/mentor10k", label: "Dashboard", icon: Sparkles, exact: true },
    { to: "/mentor10k/diagnostico", label: "Diagnóstico", icon: Target },
    { to: "/mentor10k/plano", label: "Plano", icon: ClipboardList },
    { to: "/mentor10k/chat", label: "Mentor IA", icon: MessageSquare },
    { to: "/mentor10k/checkin", label: "Check-in", icon: Activity, pro: true },
    { to: "/mentor10k/historico", label: "Histórico", icon: History, pro: true },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold mb-2">Programa exclusivo</p>
        <h1 className="font-serif text-4xl md:text-5xl gradient-text-gold">Mentor 10K</h1>
        <p className="text-muted-foreground mt-2">O teu caminho personalizado até aos primeiros 10.000€/mês.</p>
      </div>

      {!hasAccess && (
        <div className="glass-card glass-sheen rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px]">
            <p className="font-medium">Estás na versão de experiência</p>
            <p className="text-sm text-muted-foreground">
              Faz o diagnóstico, cria o teu plano e conversa com o mentor. Check-ins, histórico e mentoria ilimitada exigem o acesso completo.
            </p>
          </div>
          <Mentor10kBuyButton size="lg" label="Desbloquear tudo" />
        </div>
      )}

      <div className="glass-card rounded-2xl p-2 mb-8 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map((t) => {
            const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to as "/mentor10k"}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-gold/15 text-gold shadow-[0_4px_20px_-8px_color-mix(in_oklab,var(--gold)_50%,transparent)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
                {t.pro && !hasAccess && <Lock className="h-3 w-3 opacity-60" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {locked ? (
        <div className="glass-card rounded-3xl p-10 text-center max-w-2xl mx-auto">
          <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gold/15 flex items-center justify-center">
            <Lock className="h-8 w-8 text-gold" />
          </div>
          <h2 className="font-serif text-3xl mb-3">Esta área é do acesso completo</h2>
          <p className="text-muted-foreground mb-8">
            Já podes usar o diagnóstico, o plano e o mentor. Os check-ins semanais e o histórico de progresso fazem parte do programa completo.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Mentor10kBuyButton size="lg" />
            <Button variant="outline" size="lg" asChild>
              <Link to="/programa-mentor-10k">Saber mais</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
