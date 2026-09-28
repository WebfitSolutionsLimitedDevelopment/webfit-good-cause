-- Production is missing public.verification_documents (defined in sql/schema.sql).
-- Additive and idempotent. Organiser document uploads and the admin review page need it.
create table if not exists public.verification_documents (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id),
  kind public.document_kind not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  status public.verification_status not null default 'pending',
  uploaded_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  reviewer_note text
);
create index if not exists verification_documents_campaign_idx on public.verification_documents(campaign_id, uploaded_at desc);
alter table public.verification_documents enable row level security;
drop policy if exists "owners read documents" on public.verification_documents;
create policy "owners read documents" on public.verification_documents
  for select using (owner_user_id = auth.uid() or public.is_staff());
-- Writes happen only through the server (service role); no insert/update policy for clients.
