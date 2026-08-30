import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicCampaign } from '@/lib/public-campaigns';
import { money } from '@/lib/fees';
import { SITE } from '@/lib/constants';
import { DonatePanel } from '@/components/DonatePanel';
import { createServiceClient } from '@/lib/supabase-server';

export default async function CampaignPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const c=await getPublicCampaign(slug);
  if(!c) notFound();

  const pct=c.goal>0?Math.min(100,Math.round(c.raised/c.goal*100)):0;
  const s=createServiceClient();
  const [{data:updatesData},{data:mediaData}]=await Promise.all([
    s.from('campaign_updates').select('*').eq('campaign_id',c.id).eq('status','approved').order('published_at',{ascending:false}),
    s.from('campaign_media').select('id,kind,title,url,is_primary').eq('campaign_id',c.id).eq('status','approved').order('created_at',{ascending:false})
  ]);
  const updates=updatesData??[];
  const media=mediaData??[];
  const cover=media.find((m:any)=>m.kind==='image'&&m.is_primary);
  const galleryMedia=media.filter((m:any)=>m.id!==cover?.id);

  return <div className="shell campaign-detail">
    <article className="campaign-main">
      <div className="campaign-identity">
        <div className="eyebrow">{c.location}</div>
        <h1 className="campaign-title">{c.title}</h1>
        <p className="campaign-lead">{c.summary}</p>
      </div>

      {cover?<div className="campaign-cover"><img src={`/api/media/${cover.id}`} alt={cover.title}/><div className="campaign-chip">{c.category}</div></div>:slug==='nepal-flash-flood-relief-2026'?<div className="campaign-cover"><img src="/campaigns/nepal-flash-flood-relief-2026.png" alt="Flood damage in Nepal"/><div className="campaign-chip">{c.category}</div></div>:<div className="campaign-hero-art nepal-visual large"><div className="mountain mountain-one"></div><div className="mountain mountain-two"></div><div className="river"></div><div className="campaign-chip">{c.category}</div></div>}

      <section className="campaign-section">
        <h2>About this cause</h2>
        {c.story.replace(/\\n/g,'\n').split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}
      </section>

      {c.beneficiaryVerified && c.beneficiary && <section className="campaign-section">
        <h2>Beneficiary</h2>
        <p>{c.beneficiary}</p>
      </section>}

      {slug==='nepal-flash-flood-relief-2026'&&<section className="campaign-section"><h2>Independent humanitarian sources</h2><div className="source-list"><a href="https://www.unicef.org/nepal" target="_blank" rel="noreferrer">UNICEF Nepal</a><a href="https://www.ifrc.org/where-we-work/asia-pacific/nepal" target="_blank" rel="noreferrer">IFRC Nepal</a></div><p className="fineprint">Good Cause is not affiliated with these organisations unless expressly stated. These links are provided as independent humanitarian references.</p></section>}

      <section className="campaign-section">
        <h2>Campaign media and references</h2>
        {galleryMedia.length? <div className="campaign-media-grid">{galleryMedia.map((m:any)=><div className="media-card" key={m.id}>{m.kind==='image'?<img src={`/api/media/${m.id}`} alt={m.title}/>:<a className="text-link" href={m.url||'#'} target="_blank" rel="noreferrer">{m.title}</a>}<div><strong>{m.title}</strong><small>{m.kind}</small></div></div>)}</div>:<p className="muted">No additional campaign media has been published yet.</p>}
      </section>

      <section className="campaign-section">
        <h2>Updates</h2>
        {updates.length?updates.map((u:any)=><div className="update-card" key={u.id}><strong>{u.title}</strong><p>{u.body}</p><small>{new Date(u.published_at).toLocaleDateString('en-NZ')}</small></div>):<p className="muted">No campaign updates have been published yet.</p>}
      </section>

      <section className="campaign-section concern-strip">
        <div><h2>Questions or concerns?</h2><p>If you believe campaign information is inaccurate, tell our review team.</p></div>
        <Link className="button secondary small" href="/report">Report a concern</Link>
      </section>
    </article>

    <aside className="card sidebar donation-sidebar">
      <div className="donation-summary">
        <div className="big-raised">{money(c.raised)}</div>
        <div className="muted">{c.goal>0?`raised toward ${money(c.goal)}`:'raised'}</div>
        {c.goal>0&&<><div className="progress"><i style={{width:`${pct}%`}}/></div><div className="card-meta"><span>{c.donors} supporters</span><span>{pct}% of goal</span></div></>}
        {c.lastContributor&&<div className="latest-contribution"><span>Latest contribution</span><strong>{c.lastContributor}</strong></div>}
      </div>

      <DonatePanel campaignSlug={c.slug} enabled={SITE.paymentsEnabled}/>
      <div className="stripe-note"><strong>Secure payment</strong><span>Checkout is processed by Stripe.</span></div>
    </aside>
  </div>;
}
