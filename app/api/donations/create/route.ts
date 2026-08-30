import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SITE } from '@/lib/constants';
import { createServiceClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

function clean(value: unknown, max = 180) {
  return String(value ?? '').trim().slice(0, max);
}

function getPublicOrigin(req: NextRequest) {
  const configured = String(process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (configured && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured)) {
    return configured.replace(/\/$/, '');
  }

  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = forwardedHost || req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const protocol = forwardedProto || (host?.includes('localhost') ? 'http' : 'https');

  if (host) return `${protocol}://${host}`;
  return 'https://goodcause.webfitnews.co.nz';
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
    const anonymous = body.anonymous === true;

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
    const publicOrigin = getPublicOrigin(req);
    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${publicOrigin}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${publicOrigin}/campaigns/${campaign.slug}`,
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
      ],
      payment_intent_data: {
        metadata: {
          campaign_id: campaign.id,
          platform_fee_rate: '0.025',
          donor_name: donorName,
          donor_email: donorEmail,
          donor_mobile: donorMobile,
          anonymous: String(anonymous),
        },
      },
      metadata: {
        campaign_id: campaign.id,
        campaign_slug: campaign.slug,
        campaign_title: campaign.title,
        donation_amount_cents: String(amountCents),
        donor_name: donorName,
        donor_email: donorEmail,
        donor_mobile: donorMobile,
        anonymous: String(anonymous),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('donation_checkout_error', error);
    return NextResponse.json({ error: 'Unable to start secure checkout. Please try again.' }, { status: 500 });
  }
}
