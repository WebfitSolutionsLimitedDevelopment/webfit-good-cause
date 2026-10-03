import Link from 'next/link';
import Stripe from 'stripe';
import { processPaidSession } from '@/lib/process-paid-session';
import { handleSubscriptionCheckout } from '@/lib/recurring';

import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/donation/success', title: 'Thank you', description: 'Good Cause account access.', noindex: true });
export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function DonationSuccess({ searchParams }: Props) {
  const { session_id } = await searchParams;
  let confirmed = false;
  let monthly = false;

  if (session_id && session_id.startsWith('cs_') && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === 'paid') {
        if (session.mode === 'subscription') { monthly = true; await handleSubscriptionCheckout(stripe, session); }
        else await processPaidSession(stripe, session);
        confirmed = true;
      }
    } catch (error) {
      console.error('stripe_success_reconciliation_error', error);
    }
  }

  return (
    <section className="section">
      <div className="shell">
        <div className="success-donation card">
          <div className="success-mark">Thank you</div>
          <h1>Your support matters.</h1>
          <p>{monthly ? 'Your monthly gift is set up. We have emailed you a confirmation with a link to manage or stop it, and you will get a receipt each month.' : confirmed ? 'Your payment was successful. A Good Cause contribution receipt will be sent to the email address you provided.' : 'Your payment has been received. We are confirming the transaction and will email your Good Cause contribution receipt.'}</p>
          <div className="hero-actions">
            <Link className="button" href="/campaigns">Explore causes</Link>
            <Link className="button secondary" href="/">Back to Good Cause</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
