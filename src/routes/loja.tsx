import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EbookCard, type EbookCardData } from "@/components/EbookCard";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Catálogo — Booklair" },
      { name: "description", content: "Explora todos os ebooks Booklair: gratuitos e premium em marketing, negócios, educação e desenvolvimento pessoal." },
      { property: "og:title", content: "Catálogo — Booklair" },
      { property: "og:description", content: "Ebooks gratuitos e premium num único catálogo." },
    ],
  }),
  component: StorePage,
});

const cats = ["all", "marketing_negocios", "educacao_estudo", "desenvolvimento_pessoal"] as const;
type Cat = (typeof cats)[number];

const access = ["all", "free", "premium"] as const;
type Access = (typeof access)[number];

function StorePage() {
  const { t } = useI18n();
  const [items, setItems] = useState<EbookCardData[]>([]);
  const [filter, setFilter] = useState<Cat>("all");
  const [accessFilter, setAccessFilter] = useState<Access>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("ebooks")
      .select("id, slug, title, description, author, category, type, price_usd, price_mzn, cover_url, cover_type, cover_text_title, cover_text_subtitle, cover_bg_color, cover_text_color, cover_gradient, sale_price_usd, sale_price_mzn, sale_starts_at, sale_ends_at, free_until, available_languages, available_formats, status, scheduled_at")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("category", filter);
    q.then(({ data }) => {
      let rows = (data ?? []) as unknown as (EbookCardData & { status?: string; scheduled_at?: string | null })[];
      if (accessFilter !== "all") {
        rows = rows.filter((r) => {
          const isFreeNow = r.type === "free" || (r.free_until && new Date(r.free_until) > new Date());
          return accessFilter === "free" ? isFreeNow : !isFreeNow;
        });
      }
      setItems(rows);
      setLoading(false);
    });
  }, [filter, accessFilter]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs uppercase tracking-widest text-gold mb-3">Catálogo completo</p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground">Toda a Booklair num só sítio</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Ebooks gratuitos e premium juntos. Filtra por categoria ou acesso para encontrar o teu próximo livro.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-2 text-xs uppercase tracking-wider rounded-full border transition-colors ${
              filter === c
                ? "bg-gold text-gold-foreground border-gold"
                : "border-border text-muted-foreground hover:text-foreground hover:border-gold/40"
            }`}
          >
            {c === "all" ? t("filter.all") : t(`cat.${c}`)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {access.map((a) => (
          <button
            key={a}
            onClick={() => setAccessFilter(a)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-full border transition-colors ${
              accessFilter === a
                ? "bg-gold/15 text-gold border-gold/40"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {a === "all" ? "Todos" : a === "free" ? "Grátis" : "Premium"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card rounded-2xl p-16 text-center">
          <p className="text-muted-foreground">Nenhum ebook encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((e) => <EbookCard key={e.id} ebook={e} />)}
        </div>
      )}
    </div>
  );
}
