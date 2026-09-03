import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EbookCard, type EbookCardData } from "@/components/EbookCard";
import { Countdown } from "@/components/Countdown";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Booklair — Your Personal Library of Knowledge" },
      { name: "description", content: "Premium ebooks for entrepreneurs and ambitious minds. Marketing, business, education and personal development." },
      { property: "og:title", content: "Booklair" },
      { property: "og:description", content: "Knowledge that transforms. Curated ebooks for builders worldwide." },
    ],
  }),
  component: HomePage,
});

const categories = [
  { key: "marketing_negocios", icon: TrendingUp },
  { key: "educacao_estudo", icon: GraduationCap },
  { key: "desenvolvimento_pessoal", icon: Sparkles },
] as const;

function HomePage() {
  const { t } = useI18n();
  const [featured, setFeatured] = useState<EbookCardData[]>([]);
  const [upcoming, setUpcoming] = useState<EbookCardData[]>([]);

  useEffect(() => {
    const cols = "id, slug, title, description, author, category, type, price_usd, price_mzn, cover_url, cover_type, cover_text_title, cover_text_subtitle, cover_bg_color, cover_text_color, cover_gradient, sale_price_usd, sale_price_mzn, sale_starts_at, sale_ends_at, free_until, available_languages, available_formats, status, scheduled_at";

    supabase
      .from("ebooks")
      .select(cols)
      .eq("published", true)
      .eq("featured", true)
      .limit(8)
      .then(({ data }) => setFeatured((data ?? []) as unknown as EbookCardData[]));

    supabase
      .from("ebooks")
      .select(cols)
      .eq("status", "scheduled")
      .gt("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(4)
      .then(({ data }) => setUpcoming((data ?? []) as unknown as EbookCardData[]));
  }, []);

  return (
    <>
      {/* Hero — liquid glass */}
      <section className="aurora relative overflow-hidden rule-bottom">
        <div className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-24 relative">
          <div className="reveal flex flex-wrap items-center justify-between gap-3">
            <span className="glass-pill px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Booklair · {new Date().getFullYear()}
            </span>
            <span className="glass-pill px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              PT · EN — lifetime access
            </span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-10 pt-12 md:pt-16 items-center">
            <div className="lg:col-span-7">
              <h1 className="reveal reveal-1 font-serif text-[2.75rem] leading-[0.95] sm:text-6xl lg:text-[5.25rem] text-foreground">
                {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
                <em className="not-italic font-normal shimmer-text">
                  {t("hero.title").split(" ").slice(-2).join(" ")}
                </em>
              </h1>
              <p className="reveal reveal-2 mt-7 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">
                {t("hero.subtitle")}
              </p>
              <div className="reveal reveal-3 mt-9 flex flex-wrap items-center gap-3">
                <Button variant="hero" size="lg" asChild className="hover-lift">
                  <Link to="/loja">
                    {t("hero.cta.primary")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  to="/biblioteca"
                  className="glass-pill inline-flex items-center gap-2 px-5 py-3 text-sm text-foreground hover-lift"
                >
                  <BookOpen className="h-4 w-4 text-gold" /> {t("hero.cta.secondary")}
                </Link>
              </div>
            </div>

            {/* Glass panel */}
            <div className="lg:col-span-5">
              <div className="glass-card glass-sheen float-slow reveal reveal-3 p-6 md:p-7">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t("categories.title")}
                </p>
                <div className="mt-5 space-y-3">
                  {[
                    ["Marketing & Business", "12"],
                    ["Education & Study", "08"],
                    ["Personal Development", "10"],
                  ].map(([name, count], i) => (
                    <div
                      key={name}
                      className={`glass-pill flex items-center justify-between gap-4 px-4 py-3 reveal reveal-${i + 3}`}
                    >
                      <span className="text-sm text-foreground">{name}</span>
                      <span className="font-mono text-xs text-gold tabular-nums">{count}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                  Every title is read, chosen and curated by hand. No subscriptions, no endless catalogues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Featured */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 rule-bottom pb-4 mb-8">
            <div className="flex items-baseline gap-4">
              <span className="call-number text-ember">§ 01</span>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">{t("featured.subtitle")}</h2>
            </div>
            <Link to="/loja" className="call-number hover:text-gold transition-colors">
              {t("featured.title")} →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((e) => (
              <EbookCard key={e.id} ebook={e} />
            ))}
          </div>
        </section>
      )}

      {/* Próximos lançamentos com countdown */}
      {upcoming.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 rule-bottom pb-4 mb-8">
            <div className="flex items-baseline gap-4">
              <span className="call-number text-ember">§ 02</span>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">Em catalogação</h2>
            </div>
            <span className="call-number inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> próximos lançamentos
            </span>
          </div>
          {upcoming[0]?.scheduled_at && (
            <div className="flex justify-center mb-10">
              <Countdown to={upcoming[0].scheduled_at} label={`A seguir: "${upcoming[0].title}"`} />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {upcoming.map((e) => <EbookCard key={e.id} ebook={e} />)}
          </div>
        </section>
      )}

      {/* Categories — índice, não três cartões genéricos */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 rule-bottom pb-4">
          <div className="flex items-baseline gap-4">
            <span className="call-number text-ember">§ 03</span>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">{t("categories.subtitle")}</h2>
          </div>
          <span className="call-number">{t("categories.title")}</span>
        </div>
        <div className="mt-6 grid gap-4">
          {categories.map(({ key, icon: Icon }, i) => (
            <Link
              key={key}
              to="/loja"
              className={`group glass-card glass-sheen reveal reveal-${i + 1} grid grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 px-5 md:px-7 py-6 md:py-7`}
            >

              <span className="call-number w-10">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <h3 className="font-serif text-2xl md:text-3xl text-foreground group-hover:text-gold transition-colors">
                  {t(`cat.${key}`)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-lg">
                  Leituras escolhidas para acelerar decisões reais — não teoria de prateleira.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Icon className="hidden sm:block h-5 w-5 text-muted-foreground group-hover:text-ember transition-colors" />
                <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Nota humana + CTA */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-12 gap-8 items-start rule-top pt-12">
          <blockquote className="md:col-span-7">
            <p className="font-serif text-2xl md:text-3xl leading-snug text-foreground">
              “Comprei um título, li em duas noites e apliquei na semana seguinte. É isso que
              esperava de uma livraria — não uma subscrição que nunca uso.”
            </p>
            <footer className="mt-5 flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-[var(--ember)] text-background flex items-center justify-center font-mono text-xs">
                MC
              </span>
              <span className="text-sm text-muted-foreground">
                Marta C. — leitora, Maputo <span className="call-number ml-2">Cliente desde 2025</span>
              </span>
            </footer>
          </blockquote>
          <div className="md:col-span-5 md:pl-8 md:border-l md:border-[var(--rule)]">
            <p className="call-number">Começar</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground">
              A tua conta é gratuita. A biblioteca fica contigo.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sem subscrições. Sem letras pequenas. Compras uma vez, é teu para sempre.
            </p>
            <Button variant="hero" size="lg" asChild className="mt-6">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar conta <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </>
  );
}
