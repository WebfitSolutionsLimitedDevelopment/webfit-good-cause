update public.profiles
set role='super_admin', updated_at=now()
where email='REPLACE_WITH_SUPER_ADMIN_EMAIL';
