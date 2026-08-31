import Link from 'next/link';
import { CampaignCard } from '@/components/CampaignCard';
import { getPublicCampaigns } from '@/lib/public-campaigns';

export default async function Home(){
  const campaigns=await getPublicCampaigns();
  return <>
    <section className="hero refined-hero"><div className="shell hero-grid"><div className="hero-copy">
      <div className="kicker">New Zealand community fundraising</div><h1>Help where it matters.</h1>
      <p>Good Cause gives people a straightforward way to support verified community and humanitarian causes, with clear fees, careful review and accountable payouts.</p>
      <div className="hero-actions"><Link className="button" href="#live-causes">Support a live cause</Link><Link className="button secondary" href="/start">Start a cause</Link></div>
      <div className="trust-strip"><span>2.5% platform fee</span><span>Transparent payment processing</span><span>Campaigns reviewed before going live</span></div>
    </div><aside className="featured-appeal"><div className="appeal-body"><div className="eyebrow">Good Cause</div><h2>Community fundraising built on trust</h2><p>Support live campaigns and follow their progress, updates and transparency reporting in one place.</p><Link className="text-cta" href="/campaigns">Explore all causes</Link></div></aside></div></section>

    <section className="section" id="live-causes"><div className="shell"><div className="section-head"><div><div className="eyebrow">Live campaigns</div><h2>Choose a cause to support</h2></div><Link className="text-cta" href="/campaigns">Explore all causes</Link></div>
      {campaigns.length?<div className="grid-3">{campaigns.map(c=><CampaignCard key={c.id} campaign={c}/>)}</div>:<div className="card empty-state"><h2>No live campaigns right now</h2><p>Approved campaigns will appear here as soon as they go live.</p></div>}
    </div></section>

    <section className="section alt"><div className="shell"><div className="section-head"><div><div className="eyebrow">How it works</div><h2>Simple for supporters. Serious about trust.</h2></div></div><div className="grid-3"><div className="card feature"><div className="number">1</div><h3>Tell us about the cause</h3><p>Fundraisers explain who is raising funds, who benefits, what the money is for and provide evidence for review.</p></div><div className="card feature"><div className="number">2</div><h3>Good Cause reviews it</h3><p>Identity, beneficiary, payment destination, campaign purpose and risk checks are completed before donations are enabled.</p></div><div className="card feature"><div className="number">3</div><h3>Donate with clarity</h3><p>Supporters can see the campaign purpose, fee model, updates and fundraising progress.</p></div></div></div></section>
    <section className="section"><div className="shell fee-hero"><div className="eyebrow">Straightforward pricing</div><div className="fee-number">2.5% <small>platform fee</small></div><h2>No setup fee. No monthly fee.</h2><p className="muted">Payment-processing costs are deducted separately at the actual applicable Stripe rate.</p><Link className="button secondary" href="/fees">See the full fee breakdown</Link></div></section>
  </>;
}
