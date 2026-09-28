import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase-server';
import { adminContributionHtml, contributionReceiptEmailHtml, sendEmail } from '@/lib/email';
import { buildContributionReceiptPdf } from '@/lib/receipt-pdf';
import { FEE_MODEL_DONOR_PAYS, platformFeeCents } from '@/lib/fees';
import { createNotification, notifyAdmins } from '@/lib/notifications';

function receiptNumber(sessionId: string, created: number) {
  const year = new Date(created * 1000).getUTCFullYear();
  return `GC-${year}-${sessionId.slice(-10).toUpperCase()}`;
}

export async function processPaidSession(stripe: Stripe, session: Stripe.Checkout.Session) {
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
  const chargedTotal = charge.amount;
  const processorFee = balance?.fee ?? 0;

  // Donor-pays model: the donor paid donation + card fee. The cause receives the donation
  // less the platform fee; Good Cause absorbs any gap between the collected card fee and
  // Stripe's actual fee. Sessions created before this model use the legacy calculation.
  const donorPays = session.metadata?.fee_model === FEE_MODEL_DONOR_PAYS;
  let gross: number;
  let donorCardFee = 0;
  let net: number;
  let platformFee: number;
  if (donorPays) {
    donorCardFee = Math.max(0, Number(session.metadata?.donor_card_fee_cents || 0));
    const declaredDonation = Number(session.metadata?.donation_amount_cents || 0);
    gross = chargedTotal - donorCardFee;
    if (declaredDonation && declaredDonation !== gross) {
      console.error('donation_amount_mismatch', { session: session.id, declaredDonation, chargedTotal, donorCardFee });
    }
    platformFee = platformFeeCents(gross);
    net = Math.max(0, gross - platformFee);
  } else {
    gross = chargedTotal;
    platformFee = platformFeeCents(gross);
    net = Math.max(0, gross - processorFee - platformFee);
  }

  const donorName = session.metadata?.donor_name || session.customer_details?.name || 'Supporter';
  const donorEmail = session.metadata?.donor_email || session.customer_details?.email || '';
  const donorMobile = session.metadata?.donor_mobile || '';
  const donorMessage = (session.metadata?.donor_message || intent.metadata?.donor_message || '').trim().slice(0, 500);
  const anonymous = session.metadata?.anonymous === 'true';
  const receipt = receiptNumber(session.id, session.created);

  const donationRow: Record<string, unknown> = {
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
        message: donorMessage || null,
        receipt_number: receipt,
        paid_at: new Date((charge.created || session.created) * 1000).toISOString(),
  };
  if (donorPays) donationRow.donor_card_fee_cents = donorCardFee;

  const upsertDonation = (row: Record<string, unknown>) => db
    .from('donations')
    .upsert(row, { onConflict: 'stripe_checkout_session_id' })
    .select('id,receipt_sent_at')
    .single();

  let { data: donation, error } = await upsertDonation(donationRow);
  if (error && donorPays && /donor_card_fee_cents/.test(error.message || '')) {
    // Never lose a paid donation record if the column migration has not been applied yet.
    console.error('donor_card_fee_column_missing', error.message);
    const { donor_card_fee_cents: _omit, ...legacyRow } = donationRow;
    ({ data: donation, error } = await upsertDonation(legacyRow));
  }
  if (error || !donation) throw error || new Error('Donation upsert returned no row');

  if (donorEmail && !existing?.receipt_sent_at && !donation?.receipt_sent_at) {
    const { data: campaign } = await db.from('campaigns').select('title').eq('id', campaignId).maybeSingle();
    const paidAt = new Intl.DateTimeFormat('en-NZ', {
      dateStyle: 'long',
      timeZone: 'Pacific/Auckland',
    }).format(new Date((charge.created || session.created) * 1000));

    const campaignTitle = campaign?.title || session.metadata?.campaign_title || 'Good Cause campaign';
    const supportEmail = process.env.GOODCAUSE_SUPPORT_EMAIL?.trim() || process.env.RESEND_REPLY_TO_EMAIL?.trim() || 'sandy@webfitnews.co.nz';
    const configuredAddress = process.env.GOODCAUSE_BUSINESS_ADDRESS?.trim() || '';
    const businessAddress = configuredAddress && !/REPLACE_|placeholder/i.test(configuredAddress) ? configuredAddress : 'New Zealand';
    const receiptPdf = buildContributionReceiptPdf({
      receiptNumber: receipt,
      donorName,
      campaignTitle,
      amountCents: chargedTotal,
      donationCents: donorPays ? gross : undefined,
      cardFeeCents: donorPays ? donorCardFee : undefined,
      paidAt,
      processorReference: intent.id,
      supportEmail,
      businessAddress,
    });

    const receiptEmail = await sendEmail({
      to: donorEmail,
      subject: `Thank you for your contribution - receipt ${receipt}`,
      html: contributionReceiptEmailHtml({ donorName, receiptNumber: receipt, campaignTitle }),
      text: `Thank you, ${donorName}. Your contribution to ${campaignTitle} has been successfully received. Your Good Cause contribution receipt ${receipt} is attached as a PDF. For receipt verification or questions, email ${supportEmail}.`,
      attachments: [{
        filename: `Good-Cause-Receipt-${receipt}.pdf`,
        content: receiptPdf.toString('base64'),
      }],
    });

    if (receiptEmail.delivered) {
      await db.from('donations').update({ receipt_sent_at: new Date().toISOString() }).eq('id', donation.id);
    }
  }

  if (existing?.status !== 'succeeded') {
    const { data: campaign } = await db
      .from('campaigns')
      .select('title,reference_code,owner_id,beneficiary_id,payment_destination_id')
      .eq('id', campaignId)
      .maybeSingle();

    if (campaign?.beneficiary_id && campaign?.payment_destination_id && net > 0) {
      const { data: priorPayout } = await db
        .from('payouts')
        .select('id')
        .eq('donation_id', donation.id)
        .maybeSingle();

      if (!priorPayout) {
        const { error: payoutError } = await db.from('payouts').insert({
          campaign_id: campaignId,
          donation_id: donation.id,
          beneficiary_id: campaign.beneficiary_id,
          payment_destination_id: campaign.payment_destination_id,
          amount_cents: net,
          status: 'pending',
          requested_at: new Date().toISOString(),
        });
        if (payoutError) console.error('payout_ledger_insert_failed', { donation: donation.id, error: payoutError.message });
      }
    }

    const amount = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(gross / 100);
    const netAmount = new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(net / 100);

    await createNotification({
      userId: (campaign as any)?.owner_id,
      campaignId,
      type: 'donation_received',
      title: `New contribution received: ${amount}`,
      message: `Your campaign ${(campaign as any)?.title || ''} received ${amount}. Receipt ${receipt} has been issued to the contributor. ${netAmount} is recorded as the campaign's pending payout amount after the Good Cause platform fee${donorPays ? '. The card processing fee was paid by the contributor' : ' and Stripe processing cost'}.`,
    });

    await notifyAdmins({
      campaignId,
      type: 'donation_received',
      title: `New Good Cause contribution: ${amount}`,
      message: `${(campaign as any)?.reference_code || campaignId} received ${amount}. ${netAmount} has been added to the pending manual bank payout ledger.`,
      sendEmailNotifications: false,
    });

    const adminEmail = (process.env.GOODCAUSE_ADMIN_EMAIL || 'sandy@webfitnews.co.nz').trim();
    const paidAt = new Intl.DateTimeFormat('en-NZ', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Pacific/Auckland',
    }).format(new Date((charge.created || session.created) * 1000));

    await sendEmail({
      to: adminEmail,
      subject: `Good Cause payment received: ${amount}`,
      html: adminContributionHtml({
        campaignTitle: (campaign as any)?.title || session.metadata?.campaign_title || 'Good Cause campaign',
        campaignReference: (campaign as any)?.reference_code || null,
        amountCents: gross,
        donorName,
        donorEmail,
        receiptNumber: receipt,
        processorReference: intent.id,
        paidAt,
      }),
    }).catch((error) => console.error('goodcause_admin_email_failed', error));

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
