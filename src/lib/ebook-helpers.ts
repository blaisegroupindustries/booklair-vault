// Pricing & status helpers shared by public pages
export interface EbookPricing {
  type: "free" | "premium";
  price_usd: number | null;
  price_mzn: number | null;
  sale_price_usd: number | null;
  sale_price_mzn: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
  free_until: string | null;
}

export type EffectiveType = "free" | "premium" | "free_temp";

export function getEffectiveType(e: EbookPricing): EffectiveType {
  if (e.free_until && new Date(e.free_until) > new Date()) return "free_temp";
  return e.type;
}

export function isOnSale(e: EbookPricing): boolean {
  if (e.sale_price_usd == null) return false;
  const now = new Date();
  if (e.sale_starts_at && new Date(e.sale_starts_at) > now) return false;
  if (e.sale_ends_at && new Date(e.sale_ends_at) < now) return false;
  return true;
}

export function getDisplayPriceUSD(e: EbookPricing): number | null {
  const eff = getEffectiveType(e);
  if (eff !== "premium") return null;
  if (isOnSale(e)) return Number(e.sale_price_usd);
  return e.price_usd != null ? Number(e.price_usd) : null;
}

export function getDisplayPriceMZN(e: EbookPricing): number | null {
  const eff = getEffectiveType(e);
  if (eff !== "premium") return null;
  if (isOnSale(e) && e.sale_price_mzn != null) return Number(e.sale_price_mzn);
  return e.price_mzn != null ? Number(e.price_mzn) : null;
}

export function getDiscountPct(e: EbookPricing): number | null {
  if (!isOnSale(e) || !e.price_usd || !e.sale_price_usd) return null;
  return Math.round((1 - Number(e.sale_price_usd) / Number(e.price_usd)) * 100);
}

export const CATEGORY_OPTIONS = [
  { value: "marketing_negocios", label_pt: "Marketing & Negócios", label_en: "Marketing & Business" },
  { value: "educacao_estudo", label_pt: "Educação & Estudo", label_en: "Education & Study" },
  { value: "desenvolvimento_pessoal", label_pt: "Desenvolvimento Pessoal", label_en: "Personal Growth" },
] as const;

export const STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
] as const;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
