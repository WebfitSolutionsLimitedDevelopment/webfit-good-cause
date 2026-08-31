-- Good Cause production repair
-- Purpose: keep Sandy as super_admin and ensure BOTH active campaigns exist and are live.
-- Safe to run more than once. Existing campaign content, donations, media and IDs are preserved.

do $$
declare
  v_owner uuid;
  v_nepal uuid;
  v_omg uuid;
begin
  select id into v_owner
  from public.profiles
  where lower(email)='sandy@webfitnews.co.nz'
  limit 1;

  if v_owner is null then
    raise exception 'sandy@webfitnews.co.nz profile not found. Log in once before running this repair.';
  end if;

  update public.profiles
  set role='super_admin', updated_at=now()
  where id=v_owner and role is distinct from 'super_admin';

  select id into v_nepal from public.campaigns where slug='nepal-flash-flood-relief-2026' limit 1;
  if v_nepal is null then
    insert into public.campaigns(
      owner_id,slug,reference_code,title,summary,story,category,location,
      target_cents,currency,status,risk_level,approved_by,approved_at,published_at,created_at,updated_at
    ) values (
      v_owner,
      'nepal-flash-flood-relief-2026',
      'GC-NEPAL-2026',
      'Nepal Flash Flood Relief Appeal 2026',
      'Support humanitarian relief for communities affected by severe flash floods in northern Nepal.',
      E'Severe flash floods and debris flows struck northern Nepal in late August 2026, damaging homes, roads, bridges, water systems and other essential infrastructure.\n\nThis appeal is intended to support humanitarian relief for people affected by the floods. Funds may be used for urgent shelter, safe water, sanitation, health support, protection and other essential relief for affected communities.',
      'Emergency relief','Northern Nepal',10000000,'NZD','live','enhanced',v_owner,now(),now(),now(),now()
    ) returning id into v_nepal;
  else
    update public.campaigns
    set status='live', published_at=coalesce(published_at,now()), approved_at=coalesce(approved_at,now()), updated_at=now()
    where id=v_nepal and status is distinct from 'live';
  end if;

  select id into v_omg from public.campaigns where slug='one-more-gift-2026' limit 1;
  if v_omg is null then
    insert into public.campaigns(
      owner_id,slug,reference_code,title,summary,story,category,location,
      target_cents,currency,status,risk_level,approved_by,approved_at,published_at,created_at,updated_at
    ) values (
      v_owner,
      'one-more-gift-2026',
      'GC-OMG-2026',
      'ONE MORE GIFT 2026',
      'Add one more child to your Christmas list. A community Christmas appeal for children who might otherwise miss out.',
      E'Christmas lists can get pretty long. Our children. Our partners. Mum. Dad. Friends. Workmates. Secret Santa.\n\nThis year, we are asking New Zealand to add just one more. Not someone whose name you need to know. Not someone you need to meet. Just a child somewhere in our community whose family may be finding Christmas particularly difficult this year.\n\nThe One More Gift Christmas Appeal will bring together individuals, families, businesses and communities to raise money for approved charities and community organisations supporting children and families across New Zealand this Christmas.',
      'Community Christmas appeal','New Zealand',10000000,'NZD','live','standard',v_owner,now(),now(),now(),now()
    ) returning id into v_omg;
  else
    update public.campaigns
    set status='live', published_at=coalesce(published_at,now()), approved_at=coalesce(approved_at,now()), updated_at=now()
    where id=v_omg and status is distinct from 'live';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='campaigns' and column_name='donations_enabled'
  ) then
    execute 'update public.campaigns set donations_enabled=true where slug in (''nepal-flash-flood-relief-2026'',''one-more-gift-2026'')';
  end if;
end $$;

select id,reference_code,slug,title,status,owner_id,target_cents,published_at
from public.campaigns
where slug in ('nepal-flash-flood-relief-2026','one-more-gift-2026')
order by slug;
