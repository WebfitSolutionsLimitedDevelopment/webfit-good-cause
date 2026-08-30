'use client';
import { useMemo, useState } from 'react';
import { estimateDomesticCardFees, money } from '@/lib/fees';
import { SITE } from '@/lib/constants';

export function FeeCalculator() {
  const [amount, setAmount] = useState(100);
  const estimate = useMemo(() => estimateDomesticCardFees(amount), [amount]);
  return <div className="calculator card">
    <label htmlFor="amount">Donation amount</label>
    <div className="money-input"><span>NZ$</span><input id="amount" type="number" min={SITE.minimumDonation} step="1" value={amount} onChange={e => setAmount(Number(e.target.value))} /></div>
    <div className="fee-lines">
      <div><span>Donation</span><strong>{money(estimate.donation)}</strong></div>
      <div><span>Good Cause platform fee, 2.5%</span><strong>{money(estimate.platformFee)}</strong></div>
      <div><span>Estimated domestic card processing</span><strong>{money(estimate.processingEstimate)}</strong></div>
      <div className="total"><span>Estimated amount to cause</span><strong>{money(estimate.estimatedToCause)}</strong></div>
    </div>
    <p className="fineprint">Card processing shown here is an estimate using Stripe New Zealand standard domestic online-card pricing. Actual payment-provider costs can vary by payment method, card origin, currency conversion and any approved custom pricing.</p>
  </div>;
}
