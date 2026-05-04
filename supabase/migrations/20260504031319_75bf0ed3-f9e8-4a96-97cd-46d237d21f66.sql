DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='Scheduled ebooks viewable by everyone' AND tablename='ebooks') THEN
    CREATE POLICY "Scheduled ebooks viewable by everyone" ON public.ebooks FOR SELECT
      USING (status = 'scheduled' AND scheduled_at IS NOT NULL AND scheduled_at > now());
  END IF;
END $$;

DO $$
DECLARE
  buckets text[] := ARRAY['covers','ebooks','audio'];
  b text;
BEGIN
  FOREACH b IN ARRAY buckets LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins read '||b) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR SELECT USING (bucket_id = %L AND public.has_role(auth.uid(), ''admin''))', 'Admins read '||b, b);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins write '||b) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR INSERT WITH CHECK (bucket_id = %L AND public.has_role(auth.uid(), ''admin''))', 'Admins write '||b, b);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admins delete '||b) THEN
      EXECUTE format('CREATE POLICY %I ON storage.objects FOR DELETE USING (bucket_id = %L AND public.has_role(auth.uid(), ''admin''))', 'Admins delete '||b, b);
    END IF;
  END LOOP;
END $$;