ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS mentor10k_checkout_url text,
  ADD COLUMN IF NOT EXISTS mentor10k_price_usd numeric;

UPDATE public.site_settings SET mentor10k_price_usd = COALESCE(mentor10k_price_usd, 97) WHERE id = true;