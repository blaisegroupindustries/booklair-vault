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
  const { t, lang } = useI18n();
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
      <section className="border-b border-border/50 bg-[color-mix(in_oklab,var(--gold)_9%,transparent)]">
        <Link to="/programa-mentor-10k" className="group container mx-auto px-4 py-3 flex items-center justify-center gap-3 text-center text-sm">
          <Sparkles className="h-4 w-4 text-gold mentor-spark" />
          <strong className="text-foreground">Mentor 10K:</strong>
          <span className="text-muted-foreground">{t("home.mentor.banner")}</span>
          <ArrowRight className="h-4 w-4 text-gold transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      {/* Hero — liquid glass */}
      <section className="aurora relative overflow-hidden rule-bottom">
        <div className="container mx-auto px-4 pt-12 md:pt-20 pb-16 md:pb-24 relative">
          <div className="reveal flex flex-wrap items-center justify-between gap-3">
            <span className="glass-pill px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Booklair · {new Date().getFullYear()}
            </span>
            <span className="glass-pill px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {lang.toUpperCase()} — {t("home.access")}
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
                    [t("cat.marketing_negocios"), "12"],
                    [t("cat.educacao_estudo"), "08"],
                    [t("cat.desenvolvimento_pessoal"), "10"],
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
                  {t("home.curated")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Mentor 10K */}
      <section className="container mx-auto px-4 py-10 md:py-14">
        <Link
          to="/programa-mentor-10k"
          className="mentor-spotlight group relative block overflow-hidden rounded-3xl glass-card glass-sheen hover-lift reveal p-8 md:p-14"
        >
          <span className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[color-mix(in_oklab,var(--gold)_35%,transparent)] blur-3xl opacity-60 float-slow" />
          <span className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-[color-mix(in_oklab,var(--primary)_40%,transparent)] blur-3xl opacity-50 float-slow" />

          <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-8">
            <div>
              <span className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-gold">
                <Sparkles className="h-3.5 w-3.5" /> {t("home.mentor.eyebrow")}
              </span>
               <h2 className="mt-5 font-serif text-5xl md:text-7xl leading-[0.95]">
                <span className="shimmer-text">Mentor 10K</span>
              </h2>
              <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-muted-foreground">
                {t("home.mentor.body")}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {(lang === "pt" ? ["Diagnóstico em 5 min", "Plano de 12 semanas", "Mentor IA 24/7", "Check-ins semanais"] : ["5-minute assessment", "12-week plan", "24/7 AI mentor", "Weekly check-ins"]).map((chip, i) => (
                  <span key={chip} className={`glass-pill px-3.5 py-1.5 text-xs text-foreground reveal reveal-${i + 1}`}>
                    {chip}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                 {t("home.mentor.free")}
              </p>
            </div>

            <div className="flex md:flex-col gap-3 md:items-end">
              <Button variant="hero" size="lg" className="pointer-events-none">
                {t("home.mentor.cta")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </Link>
      </section>


      {/* Featured */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 rule-bottom pb-4 mb-8">
            <div className="flex items-baseline gap-4">
              <span className="call-number text-gold">§ 01</span>
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
              <span className="call-number text-gold">§ 02</span>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground">{t("home.upcoming.title")}</h2>
            </div>
            <span className="call-number inline-flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {t("home.upcoming.label")}
            </span>
          </div>
          {upcoming[0]?.scheduled_at && (
            <div className="flex justify-center mb-10">
              <Countdown to={upcoming[0].scheduled_at} label={`${t("home.upcoming.next")}: "${upcoming[0].title}"`} />
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
            <span className="call-number text-gold">§ 03</span>
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
                  {t("home.category.body")}
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
        <div className="grid md:grid-cols-12 gap-6 items-stretch">
          <blockquote className="md:col-span-7 glass-card reveal p-7 md:p-9">
            <p className="font-serif text-2xl md:text-3xl leading-snug text-foreground">
              {t("home.quote")}
            </p>
            <footer className="mt-5 flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-[var(--ember)] text-background flex items-center justify-center font-mono text-xs">
                MC
              </span>
              <span className="text-sm text-muted-foreground">
                {t("home.quote.by")} <span className="call-number ml-2">{t("home.quote.since")}</span>
              </span>
            </footer>
          </blockquote>
          <div className="md:col-span-5 glass-card glass-sheen reveal reveal-2 p-7 md:p-9">

            <p className="call-number">{t("home.start")}</p>
            <h2 className="mt-3 font-serif text-3xl text-foreground">
              {t("home.account.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("home.account.body")}
            </p>
            <Button variant="hero" size="lg" asChild className="mt-6">
              <Link to="/auth" search={{ mode: "signup" }}>
                {t("home.account.cta")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </>
  );
}
