import Link from 'next/link';
import Stripe from 'stripe';
import { processPaidSession } from '@/lib/process-paid-session';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ session_id?: string }> };

export default async function DonationSuccess({ searchParams }: Props) {
  const { session_id } = await searchParams;
  let confirmed = false;

  if (session_id && session_id.startsWith('cs_') && process.env.STRIPE_SECRET_KEY) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(session_id);
      if (session.payment_status === 'paid') {
        await processPaidSession(stripe, session);
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
          <p>{confirmed ? 'Your payment was successful. A Good Cause contribution receipt will be sent to the email address you provided.' : 'Your payment has been received. We are confirming the transaction and will email your Good Cause contribution receipt.'}</p>
          <div className="hero-actions">
            <Link className="button" href="/campaigns">Explore causes</Link>
            <Link className="button secondary" href="/">Back to Good Cause</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
