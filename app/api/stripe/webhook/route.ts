import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import { contributionReceiptHtml, sendEmail } from '@/lib/email';
import { SITE } from '@/lib/constants';
import { createNotification, notifyAdmins } from '@/lib/notifications';

export const runtime = 'nodejs';

function receiptNumber(sessionId: string, created: number) {
  const year = new Date(created * 1000).getUTCFullYear();
  return `GC-${year}-${sessionId.slice(-10).toUpperCase()}`;
}

async function processPaidSession(stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.payment_status !== 'paid') return;

  const campaignId = session.metadata?.campaign_id;
  if (!campaignId || !session.payment_intent) return;

  const db = createServiceClient();
  const { data: existing } = await db
    .from('donations')
    .select('id,receipt_sent_at,status')
    .eq('stripe_checkout_session_id', session.id)
    .maybeSingle();

  const intent = await stripe.paymentIntents.retrieve(String(session.payment_intent), {
    expand: ['latest_charge.balance_transaction'],
  });
  const charge = intent.latest_charge as Stripe.Charge | null;
  if (!charge) return;

  const balance = charge.balance_transaction as Stripe.BalanceTransaction | null;
  const gross = charge.amount;
  const processorFee = balance?.fee ?? 0;
  const platformFee = Math.round(gross * SITE.platformFeeRate);
  const net = Math.max(0, gross - processorFee - platformFee);

  const donorName = session.metadata?.donor_name || session.customer_details?.name || 'Supporter';
  const donorEmail = session.metadata?.donor_email || session.customer_details?.email || '';
  const donorMobile = session.metadata?.donor_mobile || '';
  const anonymous = session.metadata?.anonymous === 'true';
  const receipt = receiptNumber(session.id, session.created);

  const { data: donation, error } = await db
    .from('donations')
    .upsert(
      {
        campaign_id: campaignId,
        amount_cents: gross,
        platform_fee_cents: platformFee,
        processor_fee_cents: processorFee,
        net_to_campaign_cents: net,
        currency: 'NZD',
        processor_payment_id: intent.id,
        processor_transfer_id: null,
        stripe_checkout_session_id: session.id,
        status: 'succeeded',
        donor_display_name: donorName,
        donor_email: donorEmail || null,
        donor_mobile: donorMobile || null,
        anonymous,
        receipt_number: receipt,
        paid_at: new Date((charge.created || session.created) * 1000).toISOString(),
      },
      { onConflict: 'stripe_checkout_session_id' },
    )
    .select('id,receipt_sent_at')
    .single();

  if (error) throw error;

  if (donorEmail && !existing?.receipt_sent_at && !donation?.receipt_sent_at) {
    const { data: campaign } = await db.from('campaigns').select('title').eq('id', campaignId).maybeSingle();
    const paidAt = new Intl.DateTimeFormat('en-NZ', {
      dateStyle: 'long',
      timeZone: 'Pacific/Auckland',
    }).format(new Date((charge.created || session.created) * 1000));

    await sendEmail({
      to: donorEmail,
      subject: `Good Cause receipt ${receipt}`,
      html: contributionReceiptHtml({
        receiptNumber: receipt,
        donorName,
        campaignTitle: campaign?.title || session.metadata?.campaign_title || 'Good Cause campaign',
        amountCents: gross,
        paidAt,
        processorReference: intent.id,
      }),
    });

    await db.from('donations').update({ receipt_sent_at: new Date().toISOString() }).eq('id', donation.id);
  }

  if (existing?.status !== 'succeeded') {
    const { data: campaign } = await db
      .from('campaigns')
      .select('title,reference_code,owner_id,beneficiary_id,payment_destination_id,profiles!campaigns_owner_id_fkey(email)')
      .eq('id', campaignId)
      .maybeSingle();

    if (campaign?.beneficiary_id && campaign?.payment_destination_id && net > 0) {
      const { data: priorPayout } = await db
        .from('payouts')
        .select('id')
        .eq('donation_id', donation.id)
        .maybeSingle();

      if (!priorPayout) {
        await db.from('payouts').insert({
          campaign_id: campaignId,
          donation_id: donation.id,
          beneficiary_id: campaign.beneficiary_id,
          payment_destination_id: campaign.payment_destination_id,
          amount_cents: net,
          status: 'pending',
          requested_at: new Date().toISOString(),
        });
      }
    }

    const owner: any = (campaign as any)?.profiles;
    const amount = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(gross / 100);
    const netAmount = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(net / 100);

    await createNotification({
      userId: (campaign as any)?.owner_id,
      campaignId,
      type: 'donation_received',
      title: `New contribution received: ${amount}`,
      message: `Your campaign ${(campaign as any)?.title || ''} received ${amount}. Receipt ${receipt} has been issued to the contributor. ${netAmount} is recorded as the campaign's pending payout amount after the Good Cause platform fee and Stripe processing cost.`,
      email: owner?.email,
    });

    await notifyAdmins({
      campaignId,
      type: 'donation_received',
      title: `New Good Cause contribution: ${amount}`,
      message: `${(campaign as any)?.reference_code || campaignId} received ${amount}. ${netAmount} has been added to the pending manual bank payout ledger.`,
    });

    await db.from('audit_events').insert({
      campaign_id: campaignId,
      event_type: 'donation_succeeded',
      entity_type: 'donation',
      entity_id: donation.id,
      metadata: {
        amount_cents: gross,
        net_payout_cents: net,
        receipt_number: receipt,
        processor_payment_id: intent.id,
        payout_method: 'manual_bank_transfer',
      },
    });
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      await processPaidSession(stripe, event.data.object as Stripe.Checkout.Session);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('stripe_webhook_processing_error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
