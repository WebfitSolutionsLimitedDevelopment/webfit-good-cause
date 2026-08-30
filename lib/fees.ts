import { SITE } from './constants';

export type FeeEstimate = {
  donation: number;
  platformFee: number;
  processingEstimate: number;
  estimatedToCause: number;
};

export function estimateDomesticCardFees(donation: number): FeeEstimate {
  const safe = Math.max(0, donation);
  const platformFee = safe * SITE.platformFeeRate;
  const processingEstimate = safe > 0 ? safe * SITE.domesticCardRate + SITE.cardFixedFee : 0;
  return {
    donation: safe,
    platformFee,
    processingEstimate,
    estimatedToCause: Math.max(0, safe - platformFee - processingEstimate)
  };
}

export function money(value: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
}
