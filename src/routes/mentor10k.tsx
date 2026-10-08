import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Target, ClipboardList, Activity, MessageSquare, History, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mentor10kBuyButton } from "@/components/Mentor10kBuyButton";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/mentor10k")({
  head: () => ({ meta: [
    { title: "CEO OS — O teu plano de crescimento" },
    { name: "description", content: "Diagnóstico, plano de 12 semanas e mentor IA para chegares aos primeiros 10.000€ por mês." },
    { property: "og:title", content: "CEO OS — O teu plano de crescimento" },
    { property: "og:description", content: "Diagnóstico, plano de 12 semanas e mentor IA para chegares aos primeiros 10.000€ por mês." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: Mentor10kLayout,
});

function Mentor10kLayout() {
  const { t } = useI18n();
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
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">{t("mentor.loading")}</div>;
  }

  // Áreas gratuitas: diagnóstico, plano e primeiras conversas com o mentor.
  const freePaths = ["/mentor10k", "/mentor10k/diagnostico", "/mentor10k/plano", "/mentor10k/chat"];
  const locked = !hasAccess && !freePaths.includes(pathname);

  const tabs: Array<{ to: string; label: string; icon: typeof Sparkles; exact?: boolean; pro?: boolean }> = [
    { to: "/mentor10k", label: t("mentor.tab.dashboard"), icon: Sparkles, exact: true },
    { to: "/mentor10k/diagnostico", label: t("mentor.tab.diagnostic"), icon: Target },
    { to: "/mentor10k/plano", label: t("mentor.tab.plan"), icon: ClipboardList },
    { to: "/mentor10k/chat", label: t("mentor.tab.chat"), icon: MessageSquare },
    { to: "/mentor10k/checkin", label: t("mentor.tab.checkin"), icon: Activity, pro: true },
    { to: "/mentor10k/historico", label: t("mentor.tab.history"), icon: History, pro: true },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mentor-spotlight glass-card glass-sheen aurora mb-6 p-6 md:p-9 overflow-hidden">
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="call-number text-gold mb-2">{t("mentor.center")}</p>
            <h1 className="font-serif text-5xl md:text-7xl shimmer-text leading-none">CEO OS</h1>
            <p className="text-muted-foreground mt-3 max-w-xl">{t("mentor.tagline")}</p>
          </div>
          <div className="glass-pill px-5 py-3 text-sm text-foreground"><Sparkles className="inline h-4 w-4 text-gold mr-2" />{t("mentor.triad")}</div>
        </div>
      </div>

      {!hasAccess && (
        <div className="mentor-spotlight glass-card glass-sheen rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[240px]">
            <p className="font-medium">{t("mentor.trial.title")}</p>
            <p className="text-sm text-muted-foreground">
              {t("mentor.trial.body")}
            </p>
          </div>
          <Mentor10kBuyButton size="lg" label={t("mentor.unlock")} />
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
          <h2 className="font-serif text-3xl mb-3">{t("mentor.lock.title")}</h2>
          <p className="text-muted-foreground mb-8">
            {t("mentor.lock.body")}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Mentor10kBuyButton size="lg" />
            <Button variant="outline" size="lg" asChild>
              <Link to="/programa-mentor-10k">{t("mentor.learn")}</Link>
            </Button>
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
