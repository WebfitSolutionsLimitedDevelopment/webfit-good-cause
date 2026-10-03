import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SITE } from '@/lib/constants';
import { createServiceClient } from '@/lib/supabase-server';
import { donorPaysBreakdown, FEE_MODEL_DONOR_PAYS } from '@/lib/fees';

export const runtime = 'nodejs';

function clean(value: unknown, max = 180) {
  return String(value ?? '').trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  try {
    if (!SITE.paymentsEnabled) {
      return NextResponse.json({ error: 'Donations are temporarily unavailable.' }, { status: 503 });
    }

    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 });
    }

    const body = await req.json();
    const amount = Number(body.amount);
    const slug = clean(body.campaignSlug, 100);
    const donorName = clean(body.donorName, 120);
    const donorEmail = clean(body.donorEmail, 180).toLowerCase();
    const donorMobile = clean(body.donorMobile, 40);
    const donorMessage = clean(body.donorMessage, 500);
    const anonymous = body.anonymous === true;
    const monthly = body.frequency === 'monthly';
    if (monthly && !SITE.monthlyGivingEnabled) {
      return NextResponse.json({ error: 'Monthly giving is not available yet.' }, { status: 400 });
    }
    if (monthly && amount < 2) {
      return NextResponse.json({ error: 'The minimum monthly gift is NZ$2.' }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount < SITE.minimumDonation) {
      return NextResponse.json({ error: `Minimum donation is NZ$${SITE.minimumDonation}.` }, { status: 400 });
    }
    if (amount > 100000) {
      return NextResponse.json({ error: 'Please contact Good Cause for donations above NZ$100,000.' }, { status: 400 });
    }
    if (donorName.length < 2) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(donorEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (donorMobile.length < 7) {
      return NextResponse.json({ error: 'Please enter a valid mobile number.' }, { status: 400 });
    }

    const db = createServiceClient();
    const { data: campaign } = await db
      .from('campaigns')
      .select('id,slug,title,status')
      .eq('slug', slug)
      .eq('status', 'live')
      .maybeSingle();

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign is not available for donations.' }, { status: 404 });
    }

    const eligibleResult = await db.rpc('campaign_accepts_donations', { campaign_uuid: campaign.id });
    if (eligibleResult.error || eligibleResult.data !== true) {
      return NextResponse.json({ error: 'This campaign is not currently accepting donations.' }, { status: 403 });
    }

    const amountCents = Math.round(amount * 100);
    const fees = donorPaysBreakdown(amountCents);
    const stripe = new Stripe(key);
    const requestOrigin = new URL(req.url).origin;
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    const publicBaseUrl = configuredUrl && !configuredUrl.includes('localhost') ? configuredUrl.replace(/\/$/, '') : requestOrigin;

    if (monthly) {
      const subMeta = {
        campaign_id: campaign.id, campaign_slug: campaign.slug, fee_model: FEE_MODEL_DONOR_PAYS,
        donation_amount_cents: String(amountCents), donor_card_fee_cents: String(fees.cardFeeCents),
        donor_name: donorName, donor_email: donorEmail, donor_mobile: donorMobile, anonymous: String(anonymous), frequency: 'monthly',
      };
      const subSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        success_url: `${publicBaseUrl}/donation/success?monthly=1&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${publicBaseUrl}/campaigns/${campaign.slug}`,
        customer_email: donorEmail,
        billing_address_collection: 'auto',
        line_items: [
          { quantity: 1, price_data: { currency: 'nzd', unit_amount: amountCents, recurring: { interval: 'month' }, product_data: { name: `Monthly gift to ${campaign.title}` } } },
          { quantity: 1, price_data: { currency: 'nzd', unit_amount: fees.cardFeeCents, recurring: { interval: 'month' }, product_data: { name: 'Card processing fee' } } },
        ],
        subscription_data: { metadata: subMeta, description: `Monthly gift to ${campaign.title} on Good Cause` },
        metadata: { ...subMeta, campaign_title: campaign.title },
      });
      return NextResponse.json({ url: subSession.url });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${publicBaseUrl}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicBaseUrl}/campaigns/${campaign.slug}`,
      customer_creation: 'always',
      customer_email: donorEmail,
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: false },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'nzd',
            unit_amount: amountCents,
            product_data: {
              name: `Contribution to ${campaign.title}`,
              description: 'Good Cause community fundraising contribution',
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: 'nzd',
            unit_amount: fees.cardFeeCents,
            product_data: {
              name: 'Card processing fee',
              description: 'Covers the payment provider cost so the cause receives 97.5% of your donation',
            },
          },
        },
      ],
      payment_intent_data: {
        metadata: {
          campaign_id: campaign.id,
          platform_fee_rate: '0.025',
          fee_model: FEE_MODEL_DONOR_PAYS,
          donation_amount_cents: String(amountCents),
          donor_card_fee_cents: String(fees.cardFeeCents),
          donor_name: donorName,
          donor_email: donorEmail,
          donor_mobile: donorMobile,
          donor_message: donorMessage,
          anonymous: String(anonymous),
        },
      },
      metadata: {
        campaign_id: campaign.id,
        campaign_slug: campaign.slug,
        campaign_title: campaign.title,
        donation_amount_cents: String(amountCents),
        fee_model: FEE_MODEL_DONOR_PAYS,
        donor_card_fee_cents: String(fees.cardFeeCents),
        donor_name: donorName,
        donor_email: donorEmail,
        donor_mobile: donorMobile,
        donor_message: donorMessage,
        anonymous: String(anonymous),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('donation_checkout_error', error);
    return NextResponse.json({ error: 'Unable to start secure checkout. Please try again.' }, { status: 500 });
  }
}
