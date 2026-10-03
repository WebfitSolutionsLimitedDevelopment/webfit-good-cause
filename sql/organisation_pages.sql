-- Applied to production 4 Oct 2026. Public organisation profile pages, reviewed before publishing.
create table if not exists public.organisation_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  org_type text not null default 'community',
  about text not null default '',
  location text,
  website text,
  charity_number text,
  status text not null default 'draft' check (status in ('draft','pending','approved','rejected')),
  reviewer_note text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists organisation_pages_status_idx on public.organisation_pages(status);
alter table public.organisation_pages enable row level security;
create policy "approved organisation pages are public" on public.organisation_pages for select using (status = 'approved' or owner_id = auth.uid() or public.is_staff());
