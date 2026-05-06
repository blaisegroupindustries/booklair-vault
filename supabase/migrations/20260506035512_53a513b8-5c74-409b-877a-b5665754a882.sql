
REVOKE EXECUTE ON FUNCTION public.has_ebook_access(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_vault_access_for_email() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_ebook_access(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_vault_access_for_email() TO authenticated;
