import Link from 'next/link';
import { CampaignCard } from '@/components/CampaignCard';
import { getPublicCampaigns } from '@/lib/public-campaigns';
import { createServiceClient } from '@/lib/supabase-server';
import { money } from '@/lib/fees';

function timeAgo(value:string|null|undefined){
  if(!value) return null;
  const then=new Date(value).getTime();
  if(!Number.isFinite(then)) return null;
  const seconds=Math.max(1,Math.floor((Date.now()-then)/1000));
  if(seconds<60) return 'just now';
  const minutes=Math.floor(seconds/60);
  if(minutes<60) return `${minutes} min ago`;
  const hours=Math.floor(minutes/60);
  if(hours<24) return `${hours} hr${hours===1?'':'s'} ago`;
  const days=Math.floor(hours/24);
  if(days<30) return `${days} day${days===1?'':'s'} ago`;
  return new Date(value).toLocaleDateString('en-NZ',{day:'numeric',month:'short'});
}

export default async function Home(){
  const campaigns=await getPublicCampaigns();
  const ids=campaigns.map(c=>c.id);
  const s=createServiceClient();
  let recentSupport:any[]=[];
  let recentUpdates:any[]=[];

  if(ids.length){
    const [{data:donationData},{data:updateData}]=await Promise.all([
      s.from('donations')
        .select('id,campaign_id,amount_cents,donor_display_name,anonymous,message,paid_at,created_at')
        .in('campaign_id',ids)
        .eq('status','succeeded')
        .order('paid_at',{ascending:false,nullsFirst:false})
        .order('created_at',{ascending:false})
        .limit(6),
      s.from('campaign_updates')
        .select('id,campaign_id,title,published_at')
        .in('campaign_id',ids)
        .eq('status','approved')
        .order('published_at',{ascending:false})
        .limit(3)
    ]);
    recentSupport=donationData??[];
    recentUpdates=updateData??[];
  }

  const campaignMap=new Map(campaigns.map(c=>[c.id,c]));
  const totalRaised=campaigns.reduce((sum,c)=>sum+c.raised,0);
  const totalSupporters=campaigns.reduce((sum,c)=>sum+c.donors,0);
  const featured=campaigns[0]??null;
  const featuredPct=featured&&featured.goal>0?Math.min(100,Math.round(featured.raised/featured.goal*100)):0;

  return <>
    <section className="hero refined-hero live-home-hero"><div className="shell hero-grid"><div className="hero-copy">
      <div className="kicker"><span className="live-dot"/> New Zealand community fundraising</div><h1>Help where it matters.</h1>
      <p>Good Cause gives people a straightforward way to support reviewed community and humanitarian causes, see real progress and follow where the money goes.</p>
      <div className="hero-actions"><Link className="button" href="#live-causes">Support a live cause</Link><Link className="button secondary" href="/start">Start a cause</Link></div>
      <div className="trust-strip"><span>2.5% platform fee</span><span>Secure Stripe checkout</span><span>Campaigns reviewed before going live</span></div>
    </div>
    {featured?<aside className="featured-appeal featured-live-card">
      <div className="featured-live-visual">
        {featured.coverMediaId?<img src={`/api/media/${featured.coverMediaId}`} alt={featured.title}/>:featured.slug==='nepal-flash-flood-relief-2026'?<img src="/campaigns/nepal-flash-flood-relief-2026.png" alt="Flood damage in Nepal"/>:<div className="campaign-cover-fallback" aria-hidden="true"/>}
        <div className="live-badge"><span className="live-dot"/>Live cause</div>
      </div>
      <div className="appeal-body"><div className="eyebrow">Featured now</div><h2>{featured.title}</h2><p>{featured.summary}</p>
        <div className="progress"><i style={{width:`${featuredPct}%`}}/></div>
        <div className="featured-live-stats"><strong>{money(featured.raised)}</strong><span>{featured.donors} supporter{featured.donors===1?'':'s'}</span></div>
        <Link className="button featured-donate" href={`/campaigns/${featured.slug}`}>Support this cause</Link>
      </div>
    </aside>:<aside className="featured-appeal"><div className="appeal-body"><div className="eyebrow">Good Cause</div><h2>Community fundraising built on trust</h2><p>Approved campaigns will appear here as soon as they go live.</p><Link className="text-cta" href="/start">Start a cause</Link></div></aside>}
    </div></section>

    <section className="live-stats-section"><div className="shell live-stats-grid">
      <div><strong>{campaigns.length}</strong><span>live cause{campaigns.length===1?'':'s'}</span></div>
      <div><strong>{totalSupporters}</strong><span>supporter{totalSupporters===1?'':'s'}</span></div>
      <div><strong>{money(totalRaised)}</strong><span>raised across live causes</span></div>
      <div><strong>Reviewed</strong><span>before donations open</span></div>
    </div></section>

    {recentSupport.length>0&&<section className="section recent-support-section"><div className="shell">
      <div className="section-head"><div><div className="eyebrow"><span className="live-dot"/> Recent support</div><h2>People are helping right now</h2><p>Recent successful contributions to currently live causes.</p></div><Link className="text-cta" href="/campaigns">See all live causes</Link></div>
      <div className="recent-support-grid">{recentSupport.map((d:any)=>{
        const campaign=campaignMap.get(d.campaign_id);
        if(!campaign) return null;
        const name=d.anonymous?'Anonymous supporter':d.donor_display_name||'Supporter';
        const initial=d.anonymous?'A':name.trim().charAt(0).toUpperCase()||'S';
        return <article className="recent-support-card" key={d.id}>
          <div className="donor-avatar">{initial}</div>
          <div><div className="recent-support-head"><strong>{name}</strong><b>{money(Number(d.amount_cents||0)/100)}</b></div>
            <Link href={`/campaigns/${campaign.slug}`}>{campaign.title}</Link>
            {d.message&&<p>“{String(d.message).slice(0,140)}{String(d.message).length>140?'…':''}”</p>}
            <small>{timeAgo(d.paid_at||d.created_at)}</small>
          </div>
        </article>;
      })}</div>
    </div></section>}

    <section className="section" id="live-causes"><div className="shell"><div className="section-head"><div><div className="eyebrow">Live campaigns</div><h2>Choose a cause to support</h2><p>Every live cause below has passed the platform checks required before contributions are enabled.</p></div><Link className="text-cta" href="/campaigns">Explore all causes</Link></div>
      {campaigns.length?<div className="grid-3">{campaigns.map(c=><CampaignCard key={c.id} campaign={c}/>)}</div>:<div className="card empty-state"><h2>No live campaigns right now</h2><p>Approved campaigns will appear here as soon as they go live.</p></div>}
    </div></section>

    {recentUpdates.length>0&&<section className="section alt"><div className="shell"><div className="section-head"><div><div className="eyebrow">Latest from the causes</div><h2>Campaign updates</h2><p>Follow what fundraisers are reporting as their campaigns progress.</p></div></div>
      <div className="latest-updates-grid">{recentUpdates.map((u:any)=>{const campaign=campaignMap.get(u.campaign_id);if(!campaign)return null;return <Link className="latest-update-card" href={`/campaigns/${campaign.slug}`} key={u.id}><span>{timeAgo(u.published_at)}</span><strong>{u.title}</strong><small>{campaign.title}</small></Link>})}</div>
    </div></section>}

    <section className="section alt"><div className="shell"><div className="section-head"><div><div className="eyebrow">How it works</div><h2>Simple for supporters. Serious about trust.</h2></div></div><div className="grid-3"><div className="card feature"><div className="number">1</div><h3>Tell us about the cause</h3><p>Fundraisers explain who is raising funds, who benefits, what the money is for and provide evidence for review.</p></div><div className="card feature"><div className="number">2</div><h3>Good Cause reviews it</h3><p>Identity, beneficiary, payment destination, campaign purpose and risk checks are completed before donations are enabled.</p></div><div className="card feature"><div className="number">3</div><h3>Donate with clarity</h3><p>Supporters can see the campaign purpose, fee model, updates and fundraising progress.</p></div></div></div></section>
    <section className="section"><div className="shell fee-hero"><div className="eyebrow">Straightforward pricing</div><div className="fee-number">2.5% <small>platform fee</small></div><h2>No setup fee. No monthly fee.</h2><p className="muted">Payment-processing costs are deducted separately at the actual applicable Stripe rate.</p><Link className="button secondary" href="/fees">See the full fee breakdown</Link></div></section>
  </>;
}
