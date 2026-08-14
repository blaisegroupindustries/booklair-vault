import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EbookCard, type EbookCardData } from "@/components/EbookCard";
import { Countdown } from "@/components/Countdown";
import { ShelfMark } from "@/components/ShelfMark";
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
      {/* Hero — catálogo editorial, não "título + imagem + 2 botões" */}
      <section className="paper relative overflow-hidden rule-bottom">
        <div className="container mx-auto px-4 pt-10 md:pt-16 pb-14 md:pb-20 relative">
          <div className="flex flex-wrap items-baseline justify-between gap-3 rule-bottom pb-4">
            <span className="call-number">Booklair · Catálogo N.º {new Date().getFullYear()}</span>
            <span className="call-number">PT · EN — acesso vitalício</span>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 pt-10 md:pt-14">
            <div className="lg:col-span-7">
              <h1 className="font-serif text-[2.75rem] leading-[0.94] sm:text-6xl lg:text-[5.25rem] text-foreground">
                {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
                <em className="not-italic font-normal text-gold">
                  {t("hero.title").split(" ").slice(-2).join(" ")}
                </em>
              </h1>
              <p className="mt-7 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">
                {t("hero.subtitle")}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/loja">
                    {t("hero.cta.primary")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  to="/biblioteca"
                  className="inline-flex items-center gap-2 text-sm text-foreground underline decoration-[var(--rule)] underline-offset-[6px] hover:decoration-gold transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-ember" /> {t("hero.cta.secondary")}
                </Link>
              </div>
            </div>

            {/* Assinatura visual: estante + fichas de catálogo */}
            <div className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-[var(--rule)]">
              <ShelfMark className="h-40 md:h-48" />
              <dl className="mt-8 divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
                {[
                  ["01", "Marketing & Negócios", "12 títulos"],
                  ["02", "Educação & Estudo", "08 títulos"],
                  ["03", "Desenvolvimento Pessoal", "10 títulos"],
                ].map(([n, name, meta]) => (
                  <div key={n} className="flex items-baseline gap-4 py-3">
                    <dt className="call-number text-ember">{n}</dt>
                    <dd className="flex-1 text-sm text-foreground">{name}</dd>
                    <dd className="call-number">{meta}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Cada título é lido, escolhido e catalogado à mão. Sem subscrições, sem catálogos infinitos.
              </p>
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
        <div className="divide-y divide-[var(--rule)] border-b border-[var(--rule)]">
          {categories.map(({ key, icon: Icon }, i) => (
            <Link
              key={key}
              to="/loja"
              className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 md:gap-8 py-6 md:py-8 transition-colors hover:bg-[color-mix(in_oklab,var(--gold)_5%,transparent)]"
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
