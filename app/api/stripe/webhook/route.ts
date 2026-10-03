import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { processPaidSession } from '@/lib/process-paid-session';
import { handleSubscriptionCheckout, markSubscriptionCancelled, markSubscriptionPastDue, processPaidInvoice } from '@/lib/recurring';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !webhookSecret) {
    console.error('stripe_webhook_not_configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const stripe = new Stripe(secret);
  const signature = req.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, webhookSecret);
  } catch (error) {
    console.error('stripe_webhook_invalid_signature', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription') await handleSubscriptionCheckout(stripe, session);
      else await processPaidSession(stripe, session);
    } else if (event.type === 'invoice.paid') {
      await processPaidInvoice(stripe, event.data.object as Stripe.Invoice);
    } else if (event.type === 'invoice.payment_failed') {
      await markSubscriptionPastDue(event.data.object as Stripe.Invoice);
    } else if (event.type === 'customer.subscription.deleted') {
      await markSubscriptionCancelled(event.data.object as Stripe.Subscription);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('stripe_webhook_processing_error', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
