'use client';
import { useMemo, useState } from 'react';
import { donorPaysBreakdown, money } from '@/lib/fees';
import { SITE } from '@/lib/constants';

export function FeeCalculator() {
  const [amount, setAmount] = useState(100);
  const b = useMemo(() => donorPaysBreakdown(Math.round((Number.isFinite(amount) ? amount : 0) * 100)), [amount]);
  return <div className="calculator card">
    <label htmlFor="amount">Donation amount</label>
    <div className="money-input"><span>NZ$</span><input id="amount" type="number" min={SITE.minimumDonation} step="1" value={amount} onChange={e => setAmount(Number(e.target.value))} /></div>
    <div className="fee-lines">
      <div><span>Donation</span><strong>{money(b.donationCents / 100)}</strong></div>
      <div><span>Card processing fee, paid by the donor</span><strong>{money(b.cardFeeCents / 100)}</strong></div>
      <div><span>Donor pays in total</span><strong>{money(b.totalChargedCents / 100)}</strong></div>
      <div><span>Good Cause platform fee, 2.5% of the donation</span><strong>{money(b.platformFeeCents / 100)}</strong></div>
      <div className="total"><span>Amount to the cause</span><strong>{money(b.toCauseCents / 100)}</strong></div>
    </div>
    <p className="fineprint">The card processing fee covers what Stripe charges us for the payment. If Stripe charges more, for example on an overseas card, Good Cause covers the difference. The cause always receives 97.5% of the donation.</p>
  </div>;
}
