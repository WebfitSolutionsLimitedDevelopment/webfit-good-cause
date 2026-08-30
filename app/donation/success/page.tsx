import Link from 'next/link';

export default function DonationSuccess(){
  return <section className="section"><div className="shell"><div className="success-donation card"><div className="success-mark">Thank you</div><h1>Your support matters.</h1><p>Your donation has been received through our secure payment process. A Good Cause contribution receipt will be sent to the email address you provided before payment.</p><p>Good Cause records the platform fee, payment-processing cost and net amount allocated to the cause for reconciliation and payout reporting.</p><div className="hero-actions"><Link className="button" href="/campaigns">Explore causes</Link><Link className="button secondary" href="/">Back to Good Cause</Link></div></div></div></section>;
}
