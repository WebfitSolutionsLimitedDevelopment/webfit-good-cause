import { RelatedGuides } from '@/components/seo/RelatedGuides';
import FundraiserApplication from '@/components/onboarding/FundraiserApplication';
import { requireUser } from '@/lib/auth';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/start', title: 'Start a fundraiser in New Zealand', description: 'Apply to start an online fundraising page with Good Cause. Free to set up, reviewed by a person, and the cause keeps 97.5% of every donation.', keywords: ['start a fundraiser NZ', 'create fundraising page', 'how to raise money NZ'] });
export default async function Start(){await requireUser();return <><section className="page-hero"><div className="shell"><div className="eyebrow">Start a cause</div><h1>Start a fundraiser in New Zealand</h1><p className="muted">Create your campaign and submit the information required for beneficiary, payment and compliance review.</p></div></section><section className="section"><div className="shell"><FundraiserApplication/><RelatedGuides slugs={["how-to-fundraise-online-nz", "write-a-fundraising-page", "fundraising-ideas-nz"]}/></div></section></>}
