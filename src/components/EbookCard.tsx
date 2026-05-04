import { Link } from "@tanstack/react-router";
import { Lock, Headphones, Languages, Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EbookCover } from "./EbookCover";
import { Countdown } from "./Countdown";
import {
  getEffectiveType,
  isOnSale,
  getDisplayPriceUSD,
  getDisplayPriceMZN,
  getDiscountPct,
} from "@/lib/ebook-helpers";

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
  cover_type?: "image" | "text" | null;
  cover_text_title?: string | null;
  cover_text_subtitle?: string | null;
  cover_bg_color?: string | null;
  cover_text_color?: string | null;
  cover_gradient?: string | null;
  sale_price_usd?: number | null;
  sale_price_mzn?: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
  free_until?: string | null;
  available_languages?: string[] | null;
  available_formats?: string[] | null;
  status?: string | null;
  scheduled_at?: string | null;
}

export function EbookCard({ ebook }: { ebook: EbookCardData }) {
  const { t } = useI18n();
  const eff = getEffectiveType({
    type: ebook.type,
    price_usd: ebook.price_usd,
    price_mzn: ebook.price_mzn,
    sale_price_usd: ebook.sale_price_usd ?? null,
    sale_price_mzn: ebook.sale_price_mzn ?? null,
    sale_starts_at: ebook.sale_starts_at ?? null,
    sale_ends_at: ebook.sale_ends_at ?? null,
    free_until: ebook.free_until ?? null,
  });
  const onSale = isOnSale({
    type: ebook.type,
    price_usd: ebook.price_usd,
    price_mzn: ebook.price_mzn,
    sale_price_usd: ebook.sale_price_usd ?? null,
    sale_price_mzn: ebook.sale_price_mzn ?? null,
    sale_starts_at: ebook.sale_starts_at ?? null,
    sale_ends_at: ebook.sale_ends_at ?? null,
    free_until: ebook.free_until ?? null,
  });
  const priceUSD = getDisplayPriceUSD({
    type: ebook.type,
    price_usd: ebook.price_usd,
    price_mzn: ebook.price_mzn,
    sale_price_usd: ebook.sale_price_usd ?? null,
    sale_price_mzn: ebook.sale_price_mzn ?? null,
    sale_starts_at: ebook.sale_starts_at ?? null,
    sale_ends_at: ebook.sale_ends_at ?? null,
    free_until: ebook.free_until ?? null,
  });
  const priceMZN = getDisplayPriceMZN({
    type: ebook.type,
    price_usd: ebook.price_usd,
    price_mzn: ebook.price_mzn,
    sale_price_usd: ebook.sale_price_usd ?? null,
    sale_price_mzn: ebook.sale_price_mzn ?? null,
    sale_starts_at: ebook.sale_starts_at ?? null,
    sale_ends_at: ebook.sale_ends_at ?? null,
    free_until: ebook.free_until ?? null,
  });
  const discount = getDiscountPct({
    type: ebook.type,
    price_usd: ebook.price_usd,
    price_mzn: ebook.price_mzn,
    sale_price_usd: ebook.sale_price_usd ?? null,
    sale_price_mzn: ebook.sale_price_mzn ?? null,
    sale_starts_at: ebook.sale_starts_at ?? null,
    sale_ends_at: ebook.sale_ends_at ?? null,
    free_until: ebook.free_until ?? null,
  });

  const isFree = eff === "free" || eff === "free_temp";
  const hasAudio = ebook.available_formats?.includes("audio");
  const hasMulti = (ebook.available_languages?.length ?? 1) > 1;
  const isScheduled =
    ebook.status === "scheduled" &&
    !!ebook.scheduled_at &&
    new Date(ebook.scheduled_at) > new Date();

  return (
    <Link
      to="/ebook/$slug"
      params={{ slug: ebook.slug }}
      className="group flex flex-col surface-card rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[3/4] bg-muted overflow-hidden">
        <EbookCover ebook={{ ...ebook, cover_type: ebook.cover_type ?? "image" }} rounded="rounded-none" />

        {/* Top-right status badge */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {isScheduled ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500 text-white inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Em breve
            </span>
          ) : eff === "free_temp" ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500 text-emerald-950">
              Grátis agora
            </span>
          ) : onSale ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-rose-500 text-white">
              -{discount}%
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full backdrop-blur-md ${
                isFree
                  ? "bg-emerald-500/90 text-emerald-950"
                  : "bg-gold text-gold-foreground"
              }`}
            >
              {isFree ? t("ebook.free") : t("ebook.premium")}
            </span>
          )}
        </div>

        {isScheduled && ebook.scheduled_at && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-3 flex justify-center">
            <Countdown to={ebook.scheduled_at} compact className="text-sm font-bold text-gold" />
          </div>
        )}

        {/* Top-left format indicators */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {!isFree && (
            <div className="p-1.5 rounded-full bg-background/70 backdrop-blur-md">
              <Lock className="h-3 w-3 text-gold" />
            </div>
          )}
          {hasAudio && (
            <div className="p-1.5 rounded-full bg-background/70 backdrop-blur-md" title="Audiobook">
              <Headphones className="h-3 w-3 text-gold" />
            </div>
          )}
          {hasMulti && (
            <div className="p-1.5 rounded-full bg-background/70 backdrop-blur-md" title="PT · EN">
              <Languages className="h-3 w-3 text-gold" />
            </div>
          )}
        </div>
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
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-gold">${(priceUSD ?? 0).toFixed(2)}</span>
                {onSale && ebook.price_usd != null && (
                  <span className="text-[11px] text-muted-foreground line-through">
                    ${Number(ebook.price_usd).toFixed(2)}
                  </span>
                )}
              </div>
              {priceMZN != null && (
                <span className="text-[10px] text-muted-foreground">MZN {priceMZN.toFixed(0)}</span>
              )}
            </div>
          )}
          <span className="text-xs text-muted-foreground group-hover:text-gold transition-colors">→</span>
        </div>
      </div>
    </Link>
  );
}
