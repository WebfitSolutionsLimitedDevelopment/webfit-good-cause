-- Follow a campaign: double opt-in email subscribers for campaign updates.
-- Additive. Accessed only by the server (service role); RLS on with no client policies.
create table if not exists public.campaign_followers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  email text not null,
  token text not null unique,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (campaign_id, email)
);
create index if not exists campaign_followers_active_idx on public.campaign_followers(campaign_id) where confirmed_at is not null and unsubscribed_at is null;
alter table public.campaign_followers enable row level security;
