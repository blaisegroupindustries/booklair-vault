import { Link } from "@tanstack/react-router";
import { BookOpen, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export interface EbookCardData {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author: string | null;
  category: string;
  type: "free" | "premium";
  price_usd: number | null;
  price_mzn: number | null;
  cover_url: string | null;
}

export function EbookCard({ ebook }: { ebook: EbookCardData }) {
  const { t } = useI18n();
  const isFree = ebook.type === "free";

  return (
    <Link
      to="/ebook/$slug"
      params={{ slug: ebook.slug }}
      className="group flex flex-col surface-card rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        {ebook.cover_url ? (
          <img
            src={ebook.cover_url}
            alt={ebook.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
            <BookOpen className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full backdrop-blur-md ${
              isFree
                ? "bg-background/70 text-foreground border border-border"
                : "bg-gold text-gold-foreground"
            }`}
          >
            {isFree ? t("ebook.free") : t("ebook.premium")}
          </span>
        </div>
        {!isFree && (
          <div className="absolute top-3 left-3 p-1.5 rounded-full bg-background/70 backdrop-blur-md">
            <Lock className="h-3 w-3 text-gold" />
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[10px] uppercase tracking-widest text-gold/80 mb-1">
          {t(`cat.${ebook.category}`)}
        </p>
        <h3 className="font-serif text-lg leading-tight text-foreground group-hover:text-gold transition-colors line-clamp-2">
          {ebook.title}
        </h3>
        {ebook.author && (
          <p className="mt-1 text-xs text-muted-foreground">{ebook.author}</p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          {isFree ? (
            <span className="text-sm font-medium text-foreground">{t("ebook.free")}</span>
          ) : (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gold">${Number(ebook.price_usd ?? 0).toFixed(2)}</span>
              {ebook.price_mzn ? (
                <span className="text-[10px] text-muted-foreground">MZN {Number(ebook.price_mzn).toFixed(0)}</span>
              ) : null}
            </div>
          )}
          <span className="text-xs text-muted-foreground group-hover:text-gold transition-colors">→</span>
        </div>
      </div>
    </Link>
  );
}
