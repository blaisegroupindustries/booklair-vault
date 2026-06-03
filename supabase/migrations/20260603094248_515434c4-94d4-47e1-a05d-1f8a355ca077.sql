
-- Add checkout URL per ebook (manual Lemon Squeezy URLs)
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS checkout_url text;
ALTER TABLE public.ebooks ADD COLUMN IF NOT EXISTS lemon_squeezy_variant_id text;

-- Affiliates: a person or partner with a referral link
CREATE TABLE IF NOT EXISTS public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  code text NOT NULL UNIQUE,
  commission_percent numeric NOT NULL DEFAULT 20,
  active boolean NOT NULL DEFAULT true,
  notes text,
  total_clicks integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  total_revenue_usd numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.affiliates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliates TO authenticated;
GRANT ALL ON public.affiliates TO service_role;

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates readable by anyone" ON public.affiliates FOR SELECT USING (active = true);
CREATE POLICY "Admins manage affiliates" ON public.affiliates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Affiliate click tracking
CREATE TABLE IF NOT EXISTS public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ebook_id uuid,
  ip_address text,
  user_agent text,
  referrer text,
  landing_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.affiliate_clicks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliate_clicks TO authenticated;
GRANT ALL ON public.affiliate_clicks TO service_role;

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log clicks" ON public.affiliate_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view clicks" ON public.affiliate_clicks FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Affiliate conversions (purchases attributed)
CREATE TABLE IF NOT EXISTS public.affiliate_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ebook_id uuid,
  user_id uuid,
  email text,
  amount_usd numeric NOT NULL DEFAULT 0,
  commission_usd numeric NOT NULL DEFAULT 0,
  external_order_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliate_conversions TO authenticated;
GRANT ALL ON public.affiliate_conversions TO service_role;

ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage conversions" ON public.affiliate_conversions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Mentor 10K product access (separate from ebooks)
CREATE TABLE IF NOT EXISTS public.mentor10k_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  source text NOT NULL DEFAULT 'manual',
  external_order_id text,
  granted_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor10k_access TO authenticated;
GRANT ALL ON public.mentor10k_access TO service_role;

ALTER TABLE public.mentor10k_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own m10k access" ON public.mentor10k_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage m10k access" ON public.mentor10k_access FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Helper function: check Mentor 10K access
CREATE OR REPLACE FUNCTION public.has_mentor10k_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.mentor10k_access WHERE user_id = _user_id);
$$;
