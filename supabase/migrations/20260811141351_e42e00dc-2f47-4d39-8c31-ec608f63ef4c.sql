CREATE OR REPLACE FUNCTION public.has_mentor10k_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.mentor10k_access ma
      WHERE ma.user_id = _user_id
         OR lower(ma.email) = (SELECT lower(u.email) FROM auth.users u WHERE u.id = _user_id)
    );
$$;