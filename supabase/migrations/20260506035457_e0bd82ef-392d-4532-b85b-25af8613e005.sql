
-- Vault grants table
CREATE TABLE IF NOT EXISTS public.vault_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text,
  ebook_id uuid NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  external_order_id text,
  notes text,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vault_user ON public.vault_access_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_email ON public.vault_access_grants(lower(email));
CREATE INDEX IF NOT EXISTS idx_vault_ebook ON public.vault_access_grants(ebook_id);

ALTER TABLE public.vault_access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own grants" ON public.vault_access_grants
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins manage grants" ON public.vault_access_grants
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Access check function
CREATE OR REPLACE FUNCTION public.has_ebook_access(_user_id uuid, _ebook_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (SELECT 1 FROM public.ebooks e WHERE e.id = _ebook_id AND e.type = 'free')
    OR EXISTS (SELECT 1 FROM public.purchases p WHERE p.user_id = _user_id AND p.ebook_id = _ebook_id AND p.status = 'completed')
    OR EXISTS (SELECT 1 FROM public.vault_access_grants g WHERE g.ebook_id = _ebook_id AND g.user_id = _user_id);
$$;

-- Claim grants by email when user signs in
CREATE OR REPLACE FUNCTION public.claim_vault_access_for_email()
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = auth.uid();
  IF v_email IS NULL THEN RETURN; END IF;
  UPDATE public.vault_access_grants
    SET user_id = auth.uid()
    WHERE user_id IS NULL AND lower(email) = v_email;
END;
$$;
