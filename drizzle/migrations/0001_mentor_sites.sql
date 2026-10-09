CREATE TABLE public.mentor_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_id uuid,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  publish_requested boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentor_sites TO authenticated;
GRANT ALL ON public.mentor_sites TO service_role;
ALTER TABLE public.mentor_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sites select" ON public.mentor_sites FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own sites insert" ON public.mentor_sites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sites update" ON public.mentor_sites FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id AND is_published = false OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER mentor_sites_updated BEFORE UPDATE ON public.mentor_sites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();