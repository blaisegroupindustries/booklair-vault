import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EbookCard, type EbookCardData } from "@/components/EbookCard";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/loja")({
  head: () => ({
    meta: [
      { title: "Loja Premium — Booklair" },
      { name: "description", content: "Compra ebooks premium em marketing, negócios, educação e desenvolvimento pessoal. Pagas uma vez, ficam teus." },
      { property: "og:title", content: "Loja Premium — Booklair" },
      { property: "og:description", content: "Ebooks exclusivos. Pagas uma vez, ficam teus." },
    ],
  }),
  component: StorePage,
});

const cats = ["all", "marketing_negocios", "educacao_estudo", "desenvolvimento_pessoal"] as const;
type Cat = (typeof cats)[number];

function StorePage() {
  const { t } = useI18n();
  const [items, setItems] = useState<EbookCardData[]>([]);
  const [filter, setFilter] = useState<Cat>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase
      .from("ebooks")
      .select("id, slug, title, description, author, category, type, price_usd, price_mzn, cover_url, cover_type, cover_text_title, cover_text_subtitle, cover_bg_color, cover_text_color, cover_gradient, sale_price_usd, sale_price_mzn, sale_starts_at, sale_ends_at, free_until, available_languages, available_formats")
      .eq("published", true)
      .eq("type", "premium")
      .order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("category", filter);
    q.then(({ data }) => {
      setItems((data ?? []) as unknown as EbookCardData[]);
      setLoading(false);
    });
  }, [filter]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mb-10">
        <p className="text-xs uppercase tracking-widest text-gold mb-3">{t("store.title")}</p>
        <h1 className="font-serif text-5xl md:text-6xl text-foreground">{t("store.title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("store.subtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
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

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="surface-card rounded-2xl p-16 text-center">
          <p className="text-muted-foreground">{t("store.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((e) => <EbookCard key={e.id} ebook={e} />)}
        </div>
      )}
    </div>
  );
}
