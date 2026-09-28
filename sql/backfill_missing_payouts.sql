-- One-off: create pending payout ledger rows for succeeded donations that have none.
-- Cause: webhook selected profiles!campaigns_owner_id_fkey, but the real FK is
-- campaigns_owner_user_id_fkey, so the campaign lookup failed and no payout rows were written.
-- Idempotent. Review before running. Amounts use the net already recorded on each donation.
insert into public.payouts (campaign_id, donation_id, beneficiary_id, payment_destination_id, amount_cents, status, requested_at)
select d.campaign_id, d.id, c.beneficiary_id, c.payment_destination_id, d.net_to_campaign_cents, 'pending', coalesce(d.paid_at, d.created_at)
from public.donations d
join public.campaigns c on c.id = d.campaign_id
where d.status = 'succeeded'
  and d.net_to_campaign_cents > 0
  and c.beneficiary_id is not null
  and c.payment_destination_id is not null
  and not exists (select 1 from public.payouts p where p.donation_id = d.id);
