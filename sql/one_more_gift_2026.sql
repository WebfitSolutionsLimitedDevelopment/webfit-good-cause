-- ONE MORE GIFT 2026
-- Idempotent production campaign seed for Good Cause.
-- Run in the production Supabase SQL Editor after deploying the UI patch.

do $$
declare
  v_owner uuid;
  v_campaign uuid;
begin
  select id into v_owner
  from public.profiles
  where lower(email) = 'sandy@webfitnews.co.nz'
  limit 1;

  if v_owner is null then
    raise exception 'Cannot create One More Gift: sandy@webfitnews.co.nz profile was not found.';
  end if;

  select id into v_campaign
  from public.campaigns
  where slug = 'one-more-gift-2026'
  limit 1;

  if v_campaign is null then
    insert into public.campaigns (
      owner_id,
      slug,
      reference_code,
      title,
      summary,
      story,
      category,
      location,
      target_cents,
      currency,
      status,
      risk_level,
      approved_by,
      approved_at,
      published_at,
      created_at,
      updated_at
    ) values (
      v_owner,
      'one-more-gift-2026',
      'GC-OMG-2026',
      'ONE MORE GIFT 2026',
      'Add one more child to your Christmas list. A community Christmas appeal for children who might otherwise miss out.',
      E'Christmas lists can get pretty long. Our children. Our partners. Mum. Dad. Friends. Workmates. Secret Santa.\n\nThis year, we are asking New Zealand to add just one more. Not someone whose name you need to know. Not someone you need to meet. Just a child somewhere in our community whose family may be finding Christmas particularly difficult this year.\n\nThe One More Gift Christmas Appeal will bring together individuals, families, businesses and communities to raise money for approved charities and community organisations supporting children and families across New Zealand this Christmas.',
      'Community Christmas appeal',
      'New Zealand',
      10000000,
      'NZD',
      'live',
      'standard',
      v_owner,
      now(),
      now(),
      now(),
      now()
    ) returning id into v_campaign;
  else
    update public.campaigns
    set title = 'ONE MORE GIFT 2026',
        summary = 'Add one more child to your Christmas list. A community Christmas appeal for children who might otherwise miss out.',
        story = E'Christmas lists can get pretty long. Our children. Our partners. Mum. Dad. Friends. Workmates. Secret Santa.\n\nThis year, we are asking New Zealand to add just one more. Not someone whose name you need to know. Not someone you need to meet. Just a child somewhere in our community whose family may be finding Christmas particularly difficult this year.\n\nThe One More Gift Christmas Appeal will bring together individuals, families, businesses and communities to raise money for approved charities and community organisations supporting children and families across New Zealand this Christmas.',
        category = 'Community Christmas appeal',
        location = 'New Zealand',
        target_cents = 10000000,
        currency = 'NZD',
        status = 'live',
        risk_level = 'standard',
        approved_by = v_owner,
        approved_at = coalesce(approved_at, now()),
        published_at = coalesce(published_at, now()),
        updated_at = now()
    where id = v_campaign;
  end if;

  -- Current production Good Cause includes donations_enabled. Set it only when present.
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='campaigns' and column_name='donations_enabled'
  ) then
    execute format('update public.campaigns set donations_enabled=true where id=%L', v_campaign);
  end if;

  insert into public.audit_events (
    actor_user_id,
    campaign_id,
    event_type,
    entity_type,
    entity_id,
    metadata
  ) values (
    v_owner,
    v_campaign,
    'one_more_gift_2026_published',
    'campaign',
    v_campaign::text,
    jsonb_build_object('reference_code','GC-OMG-2026','target_nzd',100000)
  );
end $$;

select id, reference_code, slug, title, status, target_cents, published_at
from public.campaigns
where slug='one-more-gift-2026';
