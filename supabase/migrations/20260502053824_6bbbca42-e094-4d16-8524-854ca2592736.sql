GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;

ALTER TABLE public.ebooks
  ADD COLUMN IF NOT EXISTS allow_download boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS download_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS download_button_text text,
  ADD COLUMN IF NOT EXISTS countdown_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS countdown_text text;