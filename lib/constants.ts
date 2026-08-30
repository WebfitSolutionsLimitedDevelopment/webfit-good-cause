export const SITE = {
  name: 'Good Cause',
  legalOperator: 'Webfit Solutions Limited',
  parentBrand: 'Webfit News',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://goodcause.webfitnews.co.nz',
  tagline: 'Supporting people. Supporting communities. Supporting good causes.',
  minimumDonation: 1,
  platformFeeRate: 0.025,
  domesticCardRate: 0.0265,
  cardFixedFee: 0.30,
  internationalCardRate: 0.035,
  currencyConversionRate: 0.02,
  paymentsEnabled: process.env.PAYMENTS_ENABLED === 'true'
} as const;
