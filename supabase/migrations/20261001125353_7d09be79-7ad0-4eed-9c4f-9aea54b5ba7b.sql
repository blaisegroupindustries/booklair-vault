DROP POLICY IF EXISTS "own diagnostics insert" ON public.mentor10k_diagnostics;
CREATE POLICY "own diagnostics insert"
ON public.mentor10k_diagnostics
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_mentor10k_access(auth.uid())
    OR NOT EXISTS (
      SELECT 1
      FROM public.mentor10k_diagnostics AS d
      WHERE d.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "own plans insert" ON public.mentor10k_plans;
CREATE POLICY "own plans insert"
ON public.mentor10k_plans
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.has_mentor10k_access(auth.uid())
    OR NOT EXISTS (
      SELECT 1
      FROM public.mentor10k_plans AS p
      WHERE p.user_id = auth.uid()
    )
  )
);