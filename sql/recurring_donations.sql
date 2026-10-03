-- Applied to production 4 Oct 2026. Monthly giving (Stripe subscriptions).
create table if not exists public.recurring_donations (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id),
  stripe_subscription_id text not null unique,
  stripe_customer_id text,
  donor_name text,
  donor_email text not null,
  anonymous boolean not null default false,
  amount_cents bigint not null,
  card_fee_cents bigint not null default 0,
  status text not null default 'active' check (status in ('active','cancelled','past_due')),
  manage_token text not null unique,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancel_reason text
);
alter table public.recurring_donations enable row level security; -- server-only, no client policies
alter table public.donations add column if not exists recurring_donation_id uuid references public.recurring_donations(id);
-- Monthly payments reuse donations.stripe_checkout_session_id to hold the Stripe invoice id (in_...) for idempotency.
