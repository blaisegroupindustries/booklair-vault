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
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)] pointer-events-none" />
        <div className="container mx-auto px-4 pt-16 md:pt-24 pb-20 md:pb-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 text-xs uppercase tracking-widest text-gold mb-6">
                <Sparkles className="h-3 w-3" /> {t("hero.eyebrow")}
              </p>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[0.95] text-foreground">
                {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-text-gold">
                  {t("hero.title").split(" ").slice(-2).join(" ")}
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                {t("hero.subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/loja">
                    {t("hero.cta.primary")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="goldOutline" size="xl" asChild>
                  <Link to="/biblioteca">
                    <BookOpen className="h-4 w-4" /> {t("hero.cta.secondary")}
                  </Link>
                </Button>
              </div>
              <div className="mt-10 flex items-center gap-8 text-xs text-muted-foreground">
                <div>
                  <div className="text-2xl font-serif text-foreground">3</div>
                  <div className="uppercase tracking-wider">Categories</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-serif text-foreground">EN · PT</div>
                  <div className="uppercase tracking-wider">Bilingual</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-serif text-foreground">∞</div>
                  <div className="uppercase tracking-wider">Access</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-8 bg-gold/10 blur-3xl rounded-full" />
              <img
                src={heroImg}
                alt="Livro premium iluminado"
                width={1600}
                height={1024}
                className="relative rounded-3xl shadow-[var(--shadow-elevated)] border border-border/50"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured — agora antes das categorias */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold mb-3">{t("featured.title")}</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground">{t("featured.subtitle")}</h2>
            </div>
            <Link to="/loja" className="hidden md:inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all">
              View all <ArrowRight className="h-4 w-4" />
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
        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-blue-400 mb-3">
              <Clock className="h-3 w-3" /> Coming soon
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">On the way to Booklair</h2>
            <p className="mt-3 text-muted-foreground">Mark your calendar — these ebooks land soon.</p>
          </div>
          {upcoming[0]?.scheduled_at && (
            <div className="flex justify-center mb-10">
              <Countdown to={upcoming[0].scheduled_at} label={`Next: "${upcoming[0].title}"`} />
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {upcoming.map((e) => <EbookCard key={e.id} ebook={e} />)}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-widest text-gold mb-3">{t("categories.title")}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground">{t("categories.subtitle")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {categories.map(({ key, icon: Icon }) => (
            <Link
              key={key}
              to="/loja"
              className="group surface-card rounded-2xl p-8 transition-all hover:-translate-y-1 hover:border-gold/40"
            >
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/20 transition-colors">
                <Icon className="h-6 w-6 text-gold" />
              </div>
              <h3 className="font-serif text-2xl text-foreground mb-2">{t(`cat.${key}`)}</h3>
              <p className="text-sm text-muted-foreground">
                Curated content to accelerate your growth.
              </p>
              <p className="mt-5 text-xs uppercase tracking-widest text-gold flex items-center gap-1">
                Explore <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="surface-card rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] pointer-events-none" />
          <div className="relative">
            <h2 className="font-serif text-4xl md:text-5xl text-foreground max-w-2xl mx-auto">
              Build your <span className="gradient-text-gold">elite</span> library.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Create your free account and start today. No subscriptions. No fine print.
            </p>
            <Button variant="hero" size="xl" asChild className="mt-8">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
