import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EbookCard, type EbookCardData } from "@/components/EbookCard";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-book.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Booklair — Ebooks premium para mentes ambiciosas" },
      { name: "description", content: "Plataforma lusófona de ebooks premium. Marketing, negócios, educação e desenvolvimento pessoal." },
      { property: "og:title", content: "Booklair — Ebooks premium para mentes ambiciosas" },
      { property: "og:description", content: "Conhecimento que transforma. Ebooks selecionados em português e inglês." },
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

  useEffect(() => {
    supabase
      .from("ebooks")
      .select("id, slug, title, description, author, category, type, price_usd, price_mzn, cover_url")
      .eq("published", true)
      .eq("featured", true)
      .limit(8)
      .then(({ data }) => setFeatured((data ?? []) as EbookCardData[]));
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
                  <div className="uppercase tracking-wider">Categorias</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-serif text-foreground">PT · EN</div>
                  <div className="uppercase tracking-wider">Bilingue</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <div className="text-2xl font-serif text-foreground">∞</div>
                  <div className="uppercase tracking-wider">Acesso</div>
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
                Conteúdo selecionado para acelerar o teu crescimento.
              </p>
              <p className="mt-5 text-xs uppercase tracking-widest text-gold flex items-center gap-1">
                Explorar <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold mb-3">{t("featured.title")}</p>
              <h2 className="font-serif text-4xl md:text-5xl text-foreground">{t("featured.subtitle")}</h2>
            </div>
            <Link to="/loja" className="hidden md:inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all">
              Ver tudo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((e) => (
              <EbookCard key={e.id} ebook={e} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="surface-card rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[image:var(--gradient-hero)] pointer-events-none" />
          <div className="relative">
            <h2 className="font-serif text-4xl md:text-5xl text-foreground max-w-2xl mx-auto">
              Constrói a tua biblioteca de <span className="gradient-text-gold">elite</span>.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Cria a tua conta gratuita e começa hoje. Sem subscrições. Sem letras pequenas.
            </p>
            <Button variant="hero" size="xl" asChild className="mt-8">
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar conta grátis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
