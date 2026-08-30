create extension if not exists pgcrypto;

do $$ begin
  create type public.campaign_status as enum ('draft','submitted','under_review','more_information_required','enhanced_review','approved','live','suspended','payout_review','paid','rejected','closed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.verification_status as enum ('not_started','pending','verified','needs_information','failed','expired');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.risk_level as enum ('standard','enhanced','restricted');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.review_decision as enum ('approve','request_information','escalate','reject','suspend','release_payout');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.payout_status as enum ('pending','held','under_review','approved','paid','reversed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.document_kind as enum ('identity','address','beneficiary_consent','authority','purpose_evidence','bank_evidence','organisation','other');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  mobile text,
  role text not null default 'fundraiser' check (role in ('fundraiser','reviewer','finance','admin','super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fundraiser_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  fundraiser_type text not null,
  legal_name text not null,
  address text,
  country_code text not null default 'NZ',
  identity_status verification_status not null default 'not_started',
  contact_status verification_status not null default 'not_started',
  organisation_name text,
  organisation_number text,
  authority_status verification_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.beneficiaries (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_name text,
  beneficiary_type text not null,
  country_code text not null default 'NZ',
  relationship_to_fundraiser text,
  consent_status verification_status not null default 'not_started',
  identity_status verification_status not null default 'not_started',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_destinations (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id uuid not null references public.beneficiaries(id) on delete cascade,
  provider text not null default 'bank_transfer',
  account_holder_name text not null,
  provider_account_reference text,
  bank_name text,
  bank_account_number text,
  country_code text not null default 'NZ',
  currency text not null default 'NZD',
  is_active boolean not null default true,
  verification_status verification_status not null default 'not_started',
  last_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  fundraiser_profile_id uuid references public.fundraiser_profiles(id),
  beneficiary_id uuid references public.beneficiaries(id),
  payment_destination_id uuid references public.payment_destinations(id),
  slug text unique not null,
  reference_code text unique not null,
  title text not null,
  summary text not null,
  story text not null,
  category text not null,
  location text,
  target_cents bigint check(target_cents is null or target_cents >= 100),
  currency text not null default 'NZD',
  status campaign_status not null default 'draft',
  risk_level risk_level not null default 'standard',
  risk_reason text,
  moderation_notes text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.compliance_checks (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  check_key text not null, label text not null, required boolean not null default true,
  status verification_status not null default 'not_started', reviewer_note text,
  reviewed_by uuid references public.profiles(id), reviewed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(campaign_id, check_key)
);

create table if not exists public.verification_documents (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id), kind document_kind not null,
  storage_path text not null, file_name text not null, mime_type text, size_bytes bigint,
  status verification_status not null default 'pending', uploaded_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, reviewer_note text
);

create table if not exists public.policy_acceptances (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id),
  campaign_id uuid references public.campaigns(id) on delete cascade, policy_key text not null,
  policy_version text not null, accepted_at timestamptz not null default now(), ip_hash text, user_agent text
);

create table if not exists public.review_actions (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id), decision review_decision not null, reason text not null,
  from_status campaign_status, to_status campaign_status, created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id bigint generated always as identity primary key, actor_user_id uuid references public.profiles(id),
  campaign_id uuid references public.campaigns(id) on delete cascade, event_type text not null,
  entity_type text not null, entity_id text, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id),
  donor_user_id uuid references public.profiles(id), amount_cents bigint not null check(amount_cents >= 100),
  platform_fee_cents bigint not null, processor_fee_cents bigint, net_to_campaign_cents bigint,
  currency text not null default 'NZD', processor_payment_id text, processor_transfer_id text,
  stripe_checkout_session_id text unique, donor_email text, donor_mobile text, status text not null default 'pending',
  donor_display_name text, anonymous boolean not null default false, message text, receipt_number text unique,
  receipt_sent_at timestamptz, paid_at timestamptz, created_at timestamptz not null default now()
);


alter table public.donations add column if not exists donor_mobile text;
alter table public.donations add column if not exists receipt_number text;
alter table public.donations add column if not exists receipt_sent_at timestamptz;
alter table public.donations add column if not exists paid_at timestamptz;
create unique index if not exists donations_receipt_number_unique on public.donations(receipt_number) where receipt_number is not null;

create table if not exists public.campaign_updates (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade,
  title text not null, body text not null, published_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id),
  donation_id uuid unique references public.donations(id) on delete restrict,
  beneficiary_id uuid not null references public.beneficiaries(id), payment_destination_id uuid not null references public.payment_destinations(id),
  amount_cents bigint not null, status payout_status not null default 'pending', processor_transfer_id text,
  bank_transfer_reference text,
  requested_at timestamptz, reviewed_by uuid references public.profiles(id), reviewed_at timestamptz,
  created_at timestamptz not null default now(), paid_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(), campaign_id uuid references public.campaigns(id), reporter_email text,
  category text not null, details text not null, status text not null default 'open', assigned_to uuid references public.profiles(id),
  created_at timestamptz not null default now(), resolved_at timestamptz
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,full_name,role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),'fundraiser')
  on conflict(id) do update set email=excluded.email, updated_at=now();
  update public.profiles set mobile=coalesce(new.raw_user_meta_data->>'mobile',mobile) where id=new.id;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.current_app_role() returns text language sql stable security definer set search_path=public as $$
  select role from public.profiles where id=auth.uid();
$$;
create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$
  select coalesce(public.current_app_role() in ('reviewer','finance','admin','super_admin'),false);
$$;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select coalesce(public.current_app_role() in ('admin','super_admin'),false);
$$;
create or replace function public.campaign_accepts_donations(campaign_uuid uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1
    from public.campaigns c
    join public.payment_destinations pd on pd.id=c.payment_destination_id
    join public.beneficiaries b on b.id=c.beneficiary_id
    where c.id=campaign_uuid
      and c.status='live'
      and pd.verification_status='verified'
      and pd.is_active=true
      and nullif(trim(pd.account_holder_name),'') is not null
      and nullif(trim(pd.bank_name),'') is not null
      and nullif(trim(pd.bank_account_number),'') is not null
      and b.identity_status='verified'
      and b.consent_status='verified'
      and not exists(
        select 1 from public.compliance_checks cc
        where cc.campaign_id=c.id and cc.required=true and cc.status<>'verified'
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.fundraiser_profiles enable row level security;
alter table public.beneficiaries enable row level security;
alter table public.payment_destinations enable row level security;
alter table public.campaigns enable row level security;
alter table public.compliance_checks enable row level security;
alter table public.verification_documents enable row level security;
alter table public.policy_acceptances enable row level security;
alter table public.review_actions enable row level security;
alter table public.audit_events enable row level security;
alter table public.donations enable row level security;
alter table public.campaign_updates enable row level security;
alter table public.payouts enable row level security;
alter table public.reports enable row level security;

drop policy if exists "public live campaigns" on public.campaigns;
create policy "public live campaigns" on public.campaigns for select using(status='live' or owner_id=auth.uid() or public.is_staff());
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile" on public.profiles for select using(id=auth.uid() or public.is_staff());
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid() and role=public.current_app_role());
drop policy if exists "fundraiser profile access" on public.fundraiser_profiles;
create policy "fundraiser profile access" on public.fundraiser_profiles for select using(user_id=auth.uid() or public.is_staff());
drop policy if exists "owners read checks" on public.compliance_checks;
create policy "owners read checks" on public.compliance_checks for select using(public.is_staff() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));
drop policy if exists "owners read documents" on public.verification_documents;
create policy "owners read documents" on public.verification_documents for select using(owner_user_id=auth.uid() or public.is_staff());
drop policy if exists "owners read donations" on public.donations;
create policy "owners read donations" on public.donations for select using(public.is_staff() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));
drop policy if exists "updates readable" on public.campaign_updates;
create policy "updates readable" on public.campaign_updates for select using(public.is_staff() or exists(select 1 from public.campaigns c where c.id=campaign_id and (c.status='live' or c.owner_id=auth.uid())));
drop policy if exists "owners read payouts" on public.payouts;
create policy "owners read payouts" on public.payouts for select using(public.is_staff() or exists(select 1 from public.campaigns c where c.id=campaign_id and c.owner_id=auth.uid()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('verification-documents','verification-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;

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
