import Stripe from 'stripe';
import { randomBytes } from 'crypto';
import { createServiceClient } from './supabase-server';
import { contributionReceiptEmailHtml, sendEmail, workflowEmailHtml } from './email';
import { buildContributionReceiptPdf } from './receipt-pdf';
import { platformFeeCents } from './fees';
import { notifyAdmins } from './notifications';
import { SITE_URL } from './seo';

const nzd = (c: number) => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(c / 100);
const manageUrl = (token: string) => `${SITE_URL}/giving/manage?token=${token}`;

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const fromParent = invoice.parent?.subscription_details?.subscription;
  const legacy = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  const sub = fromParent || legacy;
  if (!sub) return null;
  return typeof sub === 'string' ? sub : sub.id;
}

/** Creates (or returns) the recurring_donations row for a subscription. Idempotent. */
async function ensureRecurring(sub: Stripe.Subscription) {
  const db = createServiceClient();
  const { data: existing } = await db.from('recurring_donations').select('*').eq('stripe_subscription_id', sub.id).maybeSingle();
  if (existing) return { row: existing, created: false };
  const m = sub.metadata || {};
  if (!m.campaign_id) return { row: null, created: false };
  const row = {
    campaign_id: m.campaign_id,
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id || null,
    donor_name: m.donor_name || null,
    donor_email: (m.donor_email || '').toLowerCase(),
    anonymous: m.anonymous === 'true',
    amount_cents: Number(m.donation_amount_cents || 0),
    card_fee_cents: Number(m.donor_card_fee_cents || 0),
    manage_token: randomBytes(24).toString('hex'),
  };
  const { data, error } = await db.from('recurring_donations').upsert(row, { onConflict: 'stripe_subscription_id', ignoreDuplicates: false }).select('*').single();
  if (error) throw error;
  return { row: data, created: true };
}

/** checkout.session.completed with mode=subscription: register the monthly gift and confirm by email. */
export async function handleSubscriptionCheckout(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription' || !session.subscription) return;
  const sub = await stripe.subscriptions.retrieve(typeof session.subscription === 'string' ? session.subscription : session.subscription.id);
  const { row, created } = await ensureRecurring(sub);
  if (!row || !created || !row.donor_email) return;
  const db = createServiceClient();
  const { data: campaign } = await db.from('campaigns').select('title').eq('id', row.campaign_id).maybeSingle();
  const total = Number(row.amount_cents) + Number(row.card_fee_cents);
  await sendEmail({
    to: row.donor_email,
    subject: `Your monthly gift to ${campaign?.title || 'a Good Cause campaign'} is set up`,
    html: workflowEmailHtml({ heading: 'Thank you for giving every month', message: `Your monthly gift of ${nzd(Number(row.amount_cents))} to "${campaign?.title || 'the campaign'}" is set up. You will be charged ${nzd(total)} each month (including the card processing fee), and you will get a receipt each time.\nYou can stop it at any time using the button below. Keep this email.`, ctaLabel: 'Manage or stop my monthly gift', ctaUrl: manageUrl(row.manage_token) }),
  }).catch((e) => console.error('monthly_setup_email_failed', String(e)));
}

/** invoice.paid: record each monthly payment as a donation (idempotent on invoice id). */
export async function processPaidInvoice(stripe: Stripe, invoice: Stripe.Invoice) {
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId || !invoice.id || invoice.amount_paid <= 0) return;
  const sub = await stripe.subscriptions.retrieve(subId);
  const { row: rec } = await ensureRecurring(sub);
  if (!rec) return;
  const db = createServiceClient();
  const { data: existing } = await db.from('donations').select('id,receipt_sent_at').eq('stripe_checkout_session_id', invoice.id).maybeSingle();

  const cardFee = Math.max(0, Number(rec.card_fee_cents || 0));
  const gross = Math.max(0, invoice.amount_paid - cardFee);
  const platform = platformFeeCents(gross);
  const net = Math.max(0, gross - platform);
  const receipt = `GC-${new Date(invoice.created * 1000).getUTCFullYear()}-${invoice.id.slice(-10).toUpperCase()}`;
  const paidAt = new Date(((invoice.status_transitions?.paid_at as number | null) || invoice.created) * 1000);

  const { data: donation, error } = await db.from('donations').upsert({
    campaign_id: rec.campaign_id, amount_cents: gross, platform_fee_cents: platform, processor_fee_cents: 0,
    net_to_campaign_cents: net, currency: 'NZD', processor_payment_id: invoice.id, stripe_checkout_session_id: invoice.id,
    status: 'succeeded', donor_display_name: rec.donor_name || 'Supporter', donor_email: rec.donor_email, anonymous: rec.anonymous,
    receipt_number: receipt, paid_at: paidAt.toISOString(), donor_card_fee_cents: cardFee, recurring_donation_id: rec.id,
  }, { onConflict: 'stripe_checkout_session_id' }).select('id,receipt_sent_at').single();
  if (error || !donation) throw error || new Error('monthly donation upsert failed');
  if (existing) return; // already processed

  const { data: campaign } = await db.from('campaigns').select('title,status,beneficiary_id,payment_destination_id,reference_code').eq('id', rec.campaign_id).maybeSingle();
  if (campaign?.beneficiary_id && campaign.payment_destination_id && net > 0) {
    const { error: pe } = await db.from('payouts').insert({ campaign_id: rec.campaign_id, donation_id: donation.id, beneficiary_id: campaign.beneficiary_id, payment_destination_id: campaign.payment_destination_id, amount_cents: net, status: 'pending', requested_at: new Date().toISOString() });
    if (pe) console.error('payout_ledger_insert_failed', pe.message);
  }
  await db.from('audit_events').insert({ campaign_id: rec.campaign_id, event_type: 'monthly_donation_succeeded', entity_type: 'donation', entity_id: donation.id, metadata: { amount_cents: gross, net_payout_cents: net, receipt_number: receipt, invoice: invoice.id, subscription: subId } });

  // If the campaign is no longer live, stop future charges.
  if (campaign && campaign.status !== 'live') await cancelSubscription(stripe, rec.id, `Campaign status ${campaign.status}`);

  if (rec.donor_email) {
    const title = campaign?.title || 'Good Cause campaign';
    const pdf = buildContributionReceiptPdf({ receiptNumber: receipt, donorName: rec.donor_name || 'Supporter', campaignTitle: title, amountCents: invoice.amount_paid, donationCents: gross, cardFeeCents: cardFee, paidAt: new Intl.DateTimeFormat('en-NZ', { dateStyle: 'long', timeZone: 'Pacific/Auckland' }).format(paidAt), processorReference: invoice.id, supportEmail: process.env.GOODCAUSE_SUPPORT_EMAIL?.trim() || 'support@goodcause.webfitnews.co.nz', businessAddress: 'New Zealand' });
    const sent = await sendEmail({
      to: rec.donor_email, subject: `Monthly gift receipt ${receipt}`,
      html: contributionReceiptEmailHtml({ donorName: rec.donor_name || 'Supporter', receiptNumber: receipt, campaignTitle: title }) + `<p style="font-family:Arial,sans-serif;font-size:13px;color:#5c6e64;text-align:center">This is a monthly gift. <a href="${manageUrl(rec.manage_token)}">Manage or stop it</a>.</p>`,
      text: `Thank you. Your monthly gift to ${title} was received. Receipt ${receipt} is attached. Manage or stop it: ${manageUrl(rec.manage_token)}`,
      attachments: [{ filename: `Good-Cause-Receipt-${receipt}.pdf`, content: pdf.toString('base64') }],
    }).catch((e) => { console.error('monthly_receipt_failed', String(e)); return { delivered: false }; });
    if (sent.delivered) await db.from('donations').update({ receipt_sent_at: new Date().toISOString() }).eq('id', donation.id);
  }
  await notifyAdmins({ campaignId: rec.campaign_id, type: 'donation_received', title: `Monthly gift received: ${nzd(gross)}`, message: `${campaign?.reference_code || rec.campaign_id} received a monthly gift of ${nzd(gross)}. ${nzd(net)} added to the pending payout ledger.`, sendEmailNotifications: false });
}

export async function markSubscriptionCancelled(sub: Stripe.Subscription) {
  await createServiceClient().from('recurring_donations').update({ status: 'cancelled', cancelled_at: new Date().toISOString() }).eq('stripe_subscription_id', sub.id).neq('status', 'cancelled');
}

export async function markSubscriptionPastDue(invoice: Stripe.Invoice) {
  const subId = subscriptionIdFromInvoice(invoice);
  if (subId) await createServiceClient().from('recurring_donations').update({ status: 'past_due' }).eq('stripe_subscription_id', subId).eq('status', 'active');
}

export async function cancelSubscription(stripe: Stripe, recurringId: string, reason: string) {
  const db = createServiceClient();
  const { data: rec } = await db.from('recurring_donations').select('stripe_subscription_id,status').eq('id', recurringId).maybeSingle();
  if (!rec || rec.status === 'cancelled') return false;
  try { await stripe.subscriptions.cancel(rec.stripe_subscription_id); } catch (e) { console.error('subscription_cancel_failed', String(e)); return false; }
  await db.from('recurring_donations').update({ status: 'cancelled', cancelled_at: new Date().toISOString(), cancel_reason: reason }).eq('id', recurringId);
  return true;
}

/** Stops every monthly gift for a campaign (e.g. when it closes or is suspended). */
export async function cancelCampaignSubscriptions(campaignId: string, reason: string) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return 0;
  const stripe = new Stripe(key);
  const { data } = await createServiceClient().from('recurring_donations').select('id').eq('campaign_id', campaignId).neq('status', 'cancelled');
  let n = 0;
  for (const r of data ?? []) if (await cancelSubscription(stripe, r.id, reason)) n++;
  return n;
}
