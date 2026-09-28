import { RelatedGuides } from '@/components/seo/RelatedGuides';
import FundraiserApplication from '@/components/onboarding/FundraiserApplication';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/start', title: 'Start a fundraiser in New Zealand', description: 'Apply to start an online fundraising page with Good Cause. Free to set up, reviewed by a person, and the cause keeps 97.5% of every donation.', keywords: ['start a fundraiser NZ', 'create fundraising page', 'how to raise money NZ'] });
export default async function Start(){const current=await getCurrentUser().catch(()=>null);return <><section className="page-hero"><div className="shell"><div className="eyebrow">Start a cause</div><h1>Start a fundraiser in New Zealand</h1><p className="muted">Free to start. Every fundraiser is reviewed by a person, and the cause receives 97.5% of each donation. Donors pay the card fee on top.</p></div></section><section className="section"><div className="shell">{current?<FundraiserApplication/>:<div className="prose">
  <h2>What you need to apply</h2>
  <ul><li>A Good Cause account (free)</li><li>Who the money is for, and their consent if it is not you</li><li>A realistic target and what the money will pay for</li><li>Photo ID and proof of the bank account that will receive the funds</li><li>Evidence of the cause, such as a quote, invoice or letter</li></ul>
  <h2>How it works</h2>
  <ol><li>Create an account and fill in the application.</li><li>Upload your documents from your dashboard.</li><li>We review your fundraiser and email you at each step.</li><li>Once approved, your page goes live and you can share it.</li><li>Funds are paid by bank transfer to the verified account.</li></ol>
  <h2>Fees</h2>
  <p>No setup, monthly or payout fees. Good Cause keeps 2.5% of each donation, so the cause receives 97.5%. <Link href="/fees">See full pricing</Link>.</p>
  <p><Link className="button" href="/signup?next=/start">Create a free account to apply</Link> <Link className="button secondary" href="/login?next=/start">I already have an account</Link></p>
</div>}<RelatedGuides slugs={["how-to-fundraise-online-nz", "write-a-fundraising-page", "fundraising-ideas-nz"]}/></div></section></>}
