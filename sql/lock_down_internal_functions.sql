-- Applied to production 29 Sep 2026. Internal/trigger functions are no longer callable via the public API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_role_escalation() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.generate_receipt_number() from public, anon, authenticated;
revoke execute on function public.campaign_accepts_donations(uuid) from public, anon, authenticated;
grant execute on function public.campaign_accepts_donations(uuid) to service_role;
grant execute on function public.generate_receipt_number() to service_role;
alter function public.set_updated_at() set search_path = public;
-- is_admin, is_staff, current_app_role stay executable: RLS policies call them as the signed-in user.
