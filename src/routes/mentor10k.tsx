import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Target, ClipboardList, Activity, MessageSquare, History, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

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

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-2xl text-center">
        <div className="glass-card rounded-3xl p-10">
          <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gold/15 flex items-center justify-center">
            <Lock className="h-8 w-8 text-gold" />
          </div>
          <h1 className="font-serif text-4xl mb-3">Mentor 10K</h1>
          <p className="text-muted-foreground mb-8">
            Acesso exclusivo. Adquire o programa Mentor 10K para desbloqueares o teu plano personalizado, check-ins semanais e mentoria com IA.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link to="/mentor-10k">Saber mais</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/loja">Ver loja</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: Array<{ to: string; label: string; icon: typeof Sparkles; exact?: boolean }> = [
    { to: "/mentor10k", label: "Dashboard", icon: Sparkles, exact: true },
    { to: "/mentor10k/diagnostico", label: "Diagnóstico", icon: Target },
    { to: "/mentor10k/plano", label: "Plano", icon: ClipboardList },
    { to: "/mentor10k/checkin", label: "Check-in", icon: Activity },
    { to: "/mentor10k/chat", label: "Mentor IA", icon: MessageSquare },
    { to: "/mentor10k/historico", label: "Histórico", icon: History },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold mb-2">Programa exclusivo</p>
        <h1 className="font-serif text-4xl md:text-5xl gradient-text-gold">Mentor 10K</h1>
        <p className="text-muted-foreground mt-2">O teu caminho personalizado até aos primeiros 10.000€/mês.</p>
      </div>

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
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                }`}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
