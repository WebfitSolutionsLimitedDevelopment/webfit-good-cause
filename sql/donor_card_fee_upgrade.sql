-- Donor-pays card fee model (fee_model = donor_pays_card_v1).
-- Additive and idempotent: existing donations keep donor_card_fee_cents = 0 (legacy model).
alter table public.donations
  add column if not exists donor_card_fee_cents bigint not null default 0;

comment on column public.donations.donor_card_fee_cents is
  'Card processing fee paid by the donor on top of amount_cents. amount_cents is the donation only.';
