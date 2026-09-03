import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, BookOpen, Sparkles, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

type Search = { produto?: string; slug?: string };

export const Route = createFileRoute("/obrigado")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    produto: typeof s.produto === "string" ? s.produto : undefined,
    slug: typeof s.slug === "string" ? s.slug : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Compra confirmada — Booklair" },
      { name: "description", content: "A tua compra na Booklair foi recebida. Acede já à tua biblioteca e começa a ler." },
      { property: "og:title", content: "Compra confirmada — Booklair" },
      { property: "og:description", content: "Obrigado pela tua compra. O acesso é vitalício e fica na tua conta Booklair." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://booklair-vault.lovable.app/obrigado" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://booklair-vault.lovable.app/obrigado" }],
  }),
  component: ThankYou,
});

function ThankYou() {
  const { produto, slug } = Route.useSearch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMentor = produto === "mentor10k";
  const [ready, setReady] = useState(false);
  const [tries, setTries] = useState(0);

  // Espera que o webhook liberte o acesso (pode demorar alguns segundos).
  useEffect(() => {
    if (loading || !user || ready || tries > 12) return;
    const timer = setTimeout(() => {
      void (async () => {
        if (isMentor) {
          const { data } = await supabase.rpc("has_mentor10k_access", { _user_id: user.id });
          if (data) { setReady(true); return; }
        } else {
          const { data } = await supabase
            .from("purchases")
            .select("id")
            .eq("email", (user.email ?? "").toLowerCase())
            .limit(1)
            .maybeSingle();
          if (data) { setReady(true); return; }
        }
        setTries((t) => t + 1);
      })();
    }, tries === 0 ? 500 : 2500);
    return () => clearTimeout(timer);
  }, [user, loading, ready, tries, isMentor]);

  return (
    <div className="container mx-auto px-4 py-20 max-w-2xl">
      <div className="glass-card glass-sheen reveal rounded-3xl p-8 md:p-12 text-center">
        <div className="h-16 w-16 mx-auto mb-6 rounded-2xl bg-gold/15 flex items-center justify-center">
          {ready ? <CheckCircle2 className="h-8 w-8 text-gold" /> : <Loader2 className="h-7 w-7 text-gold animate-spin" />}
        </div>

        <p className="call-number text-gold mb-3">Pagamento recebido</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">
          {isMentor ? "Bem-vindo ao Mentor 10K" : "Obrigado pela tua compra"}
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {ready
            ? isMentor
              ? "O teu acesso ao programa está ativo. Começa pelo diagnóstico — leva 5 minutos."
              : "O teu acesso está ativo e é vitalício. Podes ler já no site, sem downloads."
            : "Estamos a confirmar o pagamento com o processador. Isto costuma demorar alguns segundos."}
        </p>

        {!user && !loading && (
          <div className="mb-8 rounded-2xl border border-border/50 p-5 text-left">
            <p className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4 text-gold" /> Entra com o mesmo email da compra</p>
            <p className="text-sm text-muted-foreground mt-1">
              O acesso fica ligado ao email que usaste no checkout. Inicia sessão para o desbloquear.
            </p>
            <Button variant="gold" className="mt-4" onClick={() => navigate({ to: "/auth", search: { redirect: "/obrigado" } as never })}>
              Entrar / criar conta <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {isMentor ? (
            <Button variant="hero" size="lg" asChild>
              <Link to="/mentor10k"><Sparkles className="h-4 w-4" /> Abrir o Mentor 10K</Link>
            </Button>
          ) : slug ? (
            <Button variant="hero" size="lg" asChild>
              <Link to="/ebook/$slug" params={{ slug }}><BookOpen className="h-4 w-4" /> Ler agora</Link>
            </Button>
          ) : (
            <Button variant="hero" size="lg" asChild>
              <Link to="/biblioteca"><BookOpen className="h-4 w-4" /> Ir para a biblioteca</Link>
            </Button>
          )}
          <Button variant="outline" size="lg" asChild>
            <Link to="/loja">Ver a loja</Link>
          </Button>
        </div>

        {!ready && user && tries > 12 && (
          <p className="mt-8 text-xs text-muted-foreground">
            Ainda não vemos o pagamento. Se já pagaste, atualiza esta página dentro de um minuto ou fala connosco.
          </p>
        )}
      </div>
    </div>
  );
}
