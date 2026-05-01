
-- ============ EBOOK STATUS ENUM ============
DO $$ BEGIN
  CREATE TYPE public.ebook_status AS ENUM ('draft','scheduled','published','archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.cover_type AS ENUM ('image','text');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ EBOOKS: NEW COLUMNS ============
ALTER TABLE public.ebooks
  ADD COLUMN IF NOT EXISTS status public.ebook_status NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  -- multi-language / format files
  ADD COLUMN IF NOT EXISTS pdf_path_pt text,
  ADD COLUMN IF NOT EXISTS pdf_path_en text,
  ADD COLUMN IF NOT EXISTS audio_path_pt text,
  ADD COLUMN IF NOT EXISTS audio_path_en text,
  ADD COLUMN IF NOT EXISTS preview_audio_path text,
  ADD COLUMN IF NOT EXISTS available_languages text[] NOT NULL DEFAULT ARRAY['pt']::text[],
  ADD COLUMN IF NOT EXISTS available_formats text[] NOT NULL DEFAULT ARRAY['pdf']::text[],
  -- cover
  ADD COLUMN IF NOT EXISTS cover_type public.cover_type NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS cover_text_title text,
  ADD COLUMN IF NOT EXISTS cover_text_subtitle text,
  ADD COLUMN IF NOT EXISTS cover_bg_color text,
  ADD COLUMN IF NOT EXISTS cover_text_color text,
  ADD COLUMN IF NOT EXISTS cover_gradient text,
  -- pricing / promo / free-window
  ADD COLUMN IF NOT EXISTS sale_price_usd numeric,
  ADD COLUMN IF NOT EXISTS sale_price_mzn numeric,
  ADD COLUMN IF NOT EXISTS sale_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS sale_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS free_until timestamptz,
  ADD COLUMN IF NOT EXISTS original_type public.ebook_type,
  -- metadata
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS isbn text,
  ADD COLUMN IF NOT EXISTS publisher text,
  ADD COLUMN IF NOT EXISTS publication_year integer,
  ADD COLUMN IF NOT EXISTS narrator text,
  ADD COLUMN IF NOT EXISTS audio_duration_seconds integer,
  -- author rich data
  ADD COLUMN IF NOT EXISTS author_bio text,
  ADD COLUMN IF NOT EXISTS author_avatar_url text,
  ADD COLUMN IF NOT EXISTS author_social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- ordering / display
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_ebooks_updated_at ON public.ebooks;
CREATE TRIGGER trg_ebooks_updated_at
  BEFORE UPDATE ON public.ebooks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ EBOOK BONUSES ============
CREATE TABLE IF NOT EXISTS public.ebook_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebook_id uuid NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_path text NOT NULL,
  file_type text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ebook_bonuses_ebook ON public.ebook_bonuses(ebook_id);

ALTER TABLE public.ebook_bonuses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bonuses viewable when parent ebook is published" ON public.ebook_bonuses;
CREATE POLICY "Bonuses viewable when parent ebook is published"
  ON public.ebook_bonuses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ebooks e
    WHERE e.id = ebook_id AND e.published = true
  ));

DROP POLICY IF EXISTS "Admins manage bonuses" ON public.ebook_bonuses;
CREATE POLICY "Admins manage bonuses"
  ON public.ebook_bonuses FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ SITE SETTINGS (singleton) ============
CREATE TABLE IF NOT EXISTS public.site_settings (
  id boolean PRIMARY KEY DEFAULT true,
  site_name text NOT NULL DEFAULT 'Booklair',
  tagline text,
  logo_url text,
  contact_email text,
  footer_text text,
  banner_enabled boolean NOT NULL DEFAULT false,
  banner_text text,
  banner_link text,
  social_instagram text,
  social_facebook text,
  social_tiktok text,
  social_youtube text,
  social_x text,
  social_linkedin text,
  social_whatsapp text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = true)
);

INSERT INTO public.site_settings (id, site_name, tagline)
VALUES (true, 'Booklair', 'Conhecimento que transforma')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Site settings public read" ON public.site_settings;
CREATE POLICY "Site settings public read"
  ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins update site settings" ON public.site_settings;
CREATE POLICY "Admins update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ AUTO-PROMOTE ADMIN BY EMAIL ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_role public.app_role := 'user';
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );

  if lower(new.email) = lower('blairblaise70@gmail.com') then
    v_role := 'admin';
  end if;

  insert into public.user_roles (user_id, role) values (new.id, v_role);
  return new;
end;
$function$;

-- ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- if the user already exists, promote now
DO $$
DECLARE v_uid uuid;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE lower(email) = lower('blairblaise70@gmail.com') LIMIT 1;
  IF v_uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (v_uid, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============ AUDIO STORAGE BUCKET (private) ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', false)
ON CONFLICT (id) DO NOTHING;

-- audio bucket policies (private; admins manage, signed URLs for delivery)
DROP POLICY IF EXISTS "Admins read audio" ON storage.objects;
CREATE POLICY "Admins read audio" ON storage.objects FOR SELECT
  USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins upload audio" ON storage.objects;
CREATE POLICY "Admins upload audio" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update audio" ON storage.objects;
CREATE POLICY "Admins update audio" ON storage.objects FOR UPDATE
  USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete audio" ON storage.objects;
CREATE POLICY "Admins delete audio" ON storage.objects FOR DELETE
  USING (bucket_id = 'audio' AND public.has_role(auth.uid(), 'admin'));

-- also ensure ebooks bucket has admin write policies (in case missing)
DROP POLICY IF EXISTS "Admins manage ebooks bucket" ON storage.objects;
CREATE POLICY "Admins manage ebooks bucket" ON storage.objects FOR ALL
  USING (bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin'));

-- covers bucket: admin write
DROP POLICY IF EXISTS "Admins manage covers bucket" ON storage.objects;
CREATE POLICY "Admins manage covers bucket" ON storage.objects FOR ALL
  USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));
