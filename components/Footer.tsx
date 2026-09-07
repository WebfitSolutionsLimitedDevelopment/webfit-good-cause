import Link from 'next/link';

export function Footer() {
  return <footer className="footer">
    <div className="shell footer-grid">
      <div><strong>Good Cause</strong><p>Supporting people. Supporting communities. Supporting good causes.</p><p className="muted">Operated by Webfit Solutions Limited. A Webfit News initiative.</p></div>
      <div><strong>Fundraising</strong><Link href="/campaigns">Explore causes</Link><Link href="/start">Start a cause</Link><Link href="/how-it-works">How Good Cause works</Link><Link href="/fees">Fees</Link><Link href="/verification">Verification</Link></div>
      <div><strong>Help & trust</strong><Link href="/faq">Frequently asked questions</Link><Link href="/contact">Contact Good Cause</Link><Link href="/transparency">Transparency</Link><Link href="/safety">Safety</Link><Link href="/report">Report a concern</Link><Link href="/complaints">Complaints</Link></div>
      <div><strong>Legal</strong><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><Link href="/payment-policy">Payments</Link><Link href="/refunds">Refunds</Link><Link href="/acceptable-use">Acceptable use</Link></div>
    </div>
    <div className="shell legal-line">© {new Date().getFullYear()} Webfit Solutions Limited. All rights reserved.</div>
  </footer>;
}
