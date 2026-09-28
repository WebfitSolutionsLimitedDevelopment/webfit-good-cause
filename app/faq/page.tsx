import Link from 'next/link';

import { pageMeta } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
export const metadata = pageMeta({ path: '/faq', title: 'Fundraising questions answered', description: 'Answers to common questions about starting a fundraiser, donating, fees, receipts, refunds and payouts on Good Cause in New Zealand.', keywords: ['fundraising FAQ', 'donation questions NZ'] });
const faqs=[
  ['How does Good Cause work?','Campaigns are reviewed before donations are enabled. Supporters contribute through secure Stripe checkout, and Good Cause records the contribution, campaign allocation and payout trail.'],
  ['What information is public when I donate?','Only your display name, contribution amount, date and optional message can appear publicly. If you choose to hide your name, the page shows Anonymous supporter. Your email address and mobile number remain private.'],
  ['Can I leave a message with my contribution?','Yes. You can leave an optional public message of up to 500 characters. The donation form shows you a preview before payment.'],
  ['Where does the money go?','The intended beneficiary and payout destination are checked before donations are enabled. Campaign-specific information explains how funds are intended to be used. Good Cause can delay or withhold payout where verification, legal, fraud or dispute concerns arise.'],
  ['Are there fees?','Good Cause keeps 2.5% of each donation. The donor pays a small card processing fee on top, shown before payment, so the cause receives 97.5% of the donation. Full details are on the Fees page.'],
  ['Can I report a campaign?','Yes. If information appears inaccurate, misleading or unsafe, use the Report a concern page. Reports are reviewed by the Good Cause team.'],
  ['Can I request a refund?','Refunds are not automatic and depend on the circumstances, payment status and applicable policy. See the Refunds page for the current process.'],
  ['How can an organisation start fundraising?','Use Start a cause to submit the campaign purpose, beneficiary information and supporting evidence. Good Cause may request additional documents before approval.']
];

export default function Page(){const faqLd={'@context':'https://schema.org','@type':'FAQPage',mainEntity:faqs.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};return <><JsonLd data={faqLd}/><section className="page-hero"><div className="shell"><div className="eyebrow">Help & support</div><h1>Frequently asked questions</h1><p>Clear answers about donating, privacy, campaign checks and payouts.</p></div></section><section className="section"><div className="shell prose"><div className="faq-list">{faqs.map(([q,a])=><article className="faq-item" key={q}><h2>{q}</h2><p>{a}</p></article>)}</div><p>Still need help? <Link href="/contact">Contact Good Cause</Link>.</p></div></section></>}
