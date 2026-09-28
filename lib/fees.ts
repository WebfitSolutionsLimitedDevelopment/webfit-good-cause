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

/**
 * Donor-pays card fee model (fee_model = donor_pays_card_v1).
 * The donor pays the donation plus a card processing fee. The fee is grossed up so that,
 * at Stripe NZ standard domestic online-card pricing, Stripe's fee is fully covered.
 * The cause receives the donation less the Good Cause platform fee. Any difference between
 * the collected card fee and Stripe's actual fee (for example international cards) is
 * absorbed by Good Cause, never by the cause.
 */
export const FEE_MODEL_DONOR_PAYS = 'donor_pays_card_v1';

export function donorCardFeeCents(donationCents: number) {
  const safe = Math.max(0, Math.round(donationCents));
  if (safe === 0) return 0;
  const fixed = Math.round(SITE.cardFixedFee * 100);
  const total = Math.ceil((safe + fixed) / (1 - SITE.domesticCardRate));
  return total - safe;
}

export function platformFeeCents(donationCents: number) {
  return Math.round(Math.max(0, donationCents) * SITE.platformFeeRate);
}

export type DonorPaysBreakdown = {
  donationCents: number;
  cardFeeCents: number;
  totalChargedCents: number;
  platformFeeCents: number;
  toCauseCents: number;
};

export function donorPaysBreakdown(donationCents: number): DonorPaysBreakdown {
  const donation = Math.max(0, Math.round(donationCents));
  const cardFee = donorCardFeeCents(donation);
  const platform = platformFeeCents(donation);
  return {
    donationCents: donation,
    cardFeeCents: cardFee,
    totalChargedCents: donation + cardFee,
    platformFeeCents: platform,
    toCauseCents: Math.max(0, donation - platform),
  };
}

export function money(value: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
}
