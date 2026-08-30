-- Good Cause manual bank payout upgrade.
-- Run once in Supabase SQL Editor after applying the existing Good Cause schema.
-- Stripe remains Webfit Solutions Limited's payment processor. Beneficiaries do not connect Stripe accounts.

alter table public.payment_destinations
  add column if not exists provider text not null default 'bank_transfer',
  add column if not exists bank_name text,
  add column if not exists bank_account_number text,
  add column if not exists currency text not null default 'NZD',
  add column if not exists is_active boolean not null default true;

alter table public.payment_destinations alter column provider set default 'bank_transfer';
update public.payment_destinations set provider='bank_transfer' where provider is null or provider='stripe';
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='payment_destinations' and column_name='provider_account_reference') then
    update public.payment_destinations set provider_account_reference=null where provider_account_reference is not null;
  end if;
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='payment_destinations' and column_name='stripe_connected_account_id') then
    update public.payment_destinations set stripe_connected_account_id=null where stripe_connected_account_id is not null;
  end if;
end $$;

alter table public.payouts
  add column if not exists donation_id uuid references public.donations(id) on delete restrict,
  add column if not exists bank_transfer_reference text;

create unique index if not exists payouts_donation_id_unique
  on public.payouts(donation_id)
  where donation_id is not null;

create or replace function public.campaign_accepts_donations(campaign_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.campaigns c
    join public.payment_destinations pd on pd.id = c.payment_destination_id
    join public.beneficiaries b on b.id = c.beneficiary_id
    where c.id = campaign_uuid
      and c.status = 'live'
      and pd.verification_status = 'verified'
      and pd.is_active = true
      and nullif(trim(pd.account_holder_name), '') is not null
      and nullif(trim(pd.bank_name), '') is not null
      and nullif(trim(pd.bank_account_number), '') is not null
      and b.identity_status = 'verified'
      and b.consent_status = 'verified'
      and not exists (
        select 1
        from public.compliance_checks cc
        where cc.campaign_id = c.id
          and cc.required = true
          and cc.status <> 'verified'
      )
  );
$$;

comment on column public.payment_destinations.bank_account_number is
  'Verified beneficiary bank account used by authorised Good Cause staff for manual payouts.';

comment on column public.payouts.bank_transfer_reference is
  'Reference recorded by authorised staff after Webfit Solutions Limited completes the beneficiary bank transfer.';
