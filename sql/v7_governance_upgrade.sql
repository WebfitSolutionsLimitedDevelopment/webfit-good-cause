-- Run this once on an existing Good Cause v6 Supabase project.
-- Governance additions: pending edits, review queries, media and notifications.
create table if not exists public.campaign_change_requests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  requester_id uuid not null references public.profiles(id),
  status text not null default 'pending' check(status in ('pending','approved','rejected','cancelled')),
  change_type text not null default 'campaign_details',
  proposed_changes jsonb not null default '{}'::jsonb,
  summary text,
  admin_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_queries (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  raised_by uuid not null references public.profiles(id),
  title text not null,
  message text not null,
  status text not null default 'open' check(status in ('open','answered','resolved')),
  fundraiser_response text,
  responded_at timestamptz,
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_media (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id),
  kind text not null check(kind in ('image','video','article')),
  title text not null,
  url text,
  storage_path text,
  file_name text,
  mime_type text,
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  reviewer_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  campaign_id uuid references public.campaigns(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.campaign_updates add column if not exists status text not null default 'approved';
alter table public.campaign_updates add column if not exists submitted_by uuid references public.profiles(id);
alter table public.campaign_updates add column if not exists reviewer_note text;
alter table public.campaign_updates add column if not exists reviewed_by uuid references public.profiles(id);
alter table public.campaign_updates add column if not exists reviewed_at timestamptz;

alter table public.campaign_change_requests enable row level security;
alter table public.campaign_queries enable row level security;
alter table public.campaign_media enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "change requests owner staff" on public.campaign_change_requests;
create policy "change requests owner staff" on public.campaign_change_requests for select using(public.is_staff() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));
drop policy if exists "queries owner staff" on public.campaign_queries;
create policy "queries owner staff" on public.campaign_queries for select using(public.is_staff() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));
drop policy if exists "media public owner staff" on public.campaign_media;
create policy "media public owner staff" on public.campaign_media for select using(status='approved' or public.is_staff() or owner_user_id=auth.uid());
drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications for select using(user_id=auth.uid() or public.is_staff());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('campaign-media','campaign-media',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
alter table public.campaign_media add column if not exists is_primary boolean not null default false;
