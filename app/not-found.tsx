import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false, follow: true } };

export default function NotFound() {
  return <>
    <section className="page-hero"><div className="shell">
      <div className="eyebrow">Page not found</div>
      <h1>We could not find that page</h1>
      <p className="muted">The link may be old, or the fundraiser may have closed. These pages might help.</p>
    </div></section>
    <section className="section"><div className="shell prose">
      <ul>
        <li><Link href="/campaigns">See live fundraisers and donate</Link></li>
        <li><Link href="/start">Start a fundraiser in New Zealand</Link></li>
        <li><Link href="/guides">Fundraising guides</Link></li>
        <li><Link href="/fees">Fees: the cause receives 97.5%</Link></li>
        <li><Link href="/contact">Contact Good Cause</Link></li>
      </ul>
    </div></section>
  </>;
}
