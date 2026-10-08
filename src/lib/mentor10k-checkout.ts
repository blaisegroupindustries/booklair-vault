import { supabase } from "@/integrations/supabase/client";

export interface Mentor10kOffer {
  checkoutUrl: string | null;
  priceUsd: number | null;
}

let cached: Mentor10kOffer | null = null;

export async function fetchMentor10kOffer(): Promise<Mentor10kOffer> {
  if (cached) return cached;
  const { data } = await supabase
    .from("site_settings")
    .select("mentor10k_checkout_url, mentor10k_price_usd")
    .eq("id", true)
    .maybeSingle();
  cached = {
    checkoutUrl: (data as { mentor10k_checkout_url?: string | null } | null)?.mentor10k_checkout_url ?? null,
    priceUsd: Number((data as { mentor10k_price_usd?: number | null } | null)?.mentor10k_price_usd ?? 0) || null,
  };
  return cached;
}

/** Abre o checkout do CEO OS com email pré-preenchido e retorno para /obrigado. */
export function openMentor10kCheckout(checkoutUrl: string, email?: string | null) {
  const url = new URL(checkoutUrl);
  if (email) url.searchParams.set("checkout[email]", email);
  url.searchParams.set("checkout[custom][product]", "mentor10k");
  url.searchParams.set("checkout[success_url]", `${window.location.origin}/obrigado?produto=mentor10k`);
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}
