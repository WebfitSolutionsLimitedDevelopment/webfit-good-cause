import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicCampaign } from '@/lib/public-campaigns';
import { money } from '@/lib/fees';
import { SITE } from '@/lib/constants';
import { DonatePanel } from '@/components/DonatePanel';
import { DonorWall } from '@/components/DonorWall';
import { createServiceClient } from '@/lib/supabase-server';

export default async function CampaignPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const c=await getPublicCampaign(slug);
  if(!c) notFound();

  const pct=c.goal>0?Math.min(100,Math.round(c.raised/c.goal*100)):0;
  const s=createServiceClient();
  const [{data:updatesData},{data:mediaData},{data:donationData}]=await Promise.all([
    s.from('campaign_updates').select('*').eq('campaign_id',c.id).eq('status','approved').order('published_at',{ascending:false}),
    s.from('campaign_media').select('id,kind,title,url,is_primary').eq('campaign_id',c.id).eq('status','approved').order('created_at',{ascending:false}),
    s.from('donations').select('id,amount_cents,donor_display_name,anonymous,message,paid_at,created_at').eq('campaign_id',c.id).eq('status','succeeded').order('paid_at',{ascending:false,nullsFirst:false}).order('created_at',{ascending:false})
  ]);
  const updates=updatesData??[];
  const media=mediaData??[];
  const donations=(donationData??[]) as any[];
  const imageMedia=media.filter((m:any)=>m.kind==='image');
  const cover=imageMedia.find((m:any)=>m.is_primary) ?? imageMedia[0] ?? null;
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

      {slug==='nepal-flash-flood-relief-2026'&&<section className="campaign-section transparency-note"><h2>Where your support will go</h2><p>Funds collected through this appeal will be accumulated by Good Cause and, once the appeal closes, the net amount available for distribution will be transferred to the Government of Nepal's Prime Minister's Disaster Relief Fund, administered through the Office of the Prime Minister and Council of Ministers.</p><p>Good Cause will publish a final update on this campaign page confirming the total amount raised, the amount transferred and confirmation that the transfer has been completed.</p><p className="fineprint">Prefer to contribute directly to the Government of Nepal fund? <a href="https://pmdrf.nchl.com.np/" target="_blank" rel="noreferrer">Official Prime Minister's Disaster Relief Fund donation portal</a>.</p></section>}

      {slug==='one-more-gift-2026'&&<>
        <section className="campaign-section transparency-note">
          <h2>Your Christmas list has room for one more.</h2>
          <p>You may never know their name. They may never know yours. But somewhere this Christmas, a child could open something special because you decided there was room for one more.</p>
        </section>

        <section className="campaign-section">
          <h2>How One More Gift works</h2>
          <p>One More Gift is a national community Christmas appeal. Instead of collecting physical presents, the campaign brings together contributions from individuals, families, businesses and communities across New Zealand.</p>
          <p>Money raised through the appeal will be distributed to approved charities and established community organisations that already know the children and families they support. Depending on local needs, funding may be used for Christmas gifts, books, sporting equipment, food, supermarket vouchers, gift cards or other agreed Christmas support.</p>
          <p><strong>We collect money, not toys.</strong> This allows local organisations to provide appropriate support with dignity and without creating unnecessary storage, transport or gift-matching problems.</p>
        </section>

        <section className="campaign-section">
          <h2>Give whatever feels right</h2>
          <p>There is no correct amount. You can give NZ$2, NZ$5, NZ$10, NZ$20, NZ$50 or whatever is comfortable for you, up to NZ$2,000 through this campaign.</p>
          <p>A small donation is not a small act. If thousands of us give a little, together we can create something extraordinary.</p>
        </section>

        <section className="campaign-section">
          <h2>Pass Christmas On</h2>
          <p>Registered charities and established community organisations supporting children and families will be able to apply to become One More Gift distribution partners.</p>
          <p>Approved partners and the amounts distributed to them will be publicly disclosed as part of the campaign transparency reporting. We will not promise a specific number of children before participating organisations confirm their actual needs and costs.</p>
        </section>

        <section className="campaign-section">
          <h2>Businesses, schools and community groups</h2>
          <p>Businesses, schools, workplaces, restaurants, supermarkets, churches, temples, gurdwaras, mosques, sports clubs, cultural groups, professional associations and community events can all take part.</p>
          <p>Participating organisations can share the campaign and use a campaign QR code to help their communities contribute directly to One More Gift.</p>
        </section>

        <section className="campaign-section transparency-note">
          <h2>Our promise to donors</h2>
          <p>Good Cause will publish a full campaign update after the appeal is completed. It will show how much was raised, how much was distributed, which approved organisations received funding and the outcomes reported by participating organisations.</p>
          <p>100% of net donations received by the appeal will be distributed to approved community partners.</p>
          <p><strong>You gave the money. You deserve to know where it went.</strong></p>
        </section>

        <section className="campaign-section">
          <h2>One more gift. One more smile.</h2>
          <p>One community making Christmas brighter together.</p>
          <p><strong>Add one more child to your Christmas list.</strong></p>
          <p>#OneMoreGiftNZ</p>
        </section>
      </>}

      {c.beneficiaryVerified && c.beneficiary && <section className="campaign-section">
        <h2>Beneficiary</h2>
        <p>{c.beneficiary}</p>
      </section>}

      {slug==='nepal-flash-flood-relief-2026'&&<section className="campaign-section"><h2>Independent humanitarian sources</h2><div className="source-list"><a href="https://www.unicef.org/nepal" target="_blank" rel="noreferrer">UNICEF Nepal</a><a href="https://www.ifrc.org/where-we-work/asia-pacific/nepal" target="_blank" rel="noreferrer">IFRC Nepal</a></div><p className="fineprint">Good Cause is not affiliated with these organisations unless expressly stated. These links are provided as independent humanitarian references.</p></section>}

      <section className="campaign-section">
        <h2>Campaign media and references</h2>
        {slug==='nepal-flash-flood-relief-2026'&&<div className="source-list"><a href="https://webfitnews.com/nepal-flood-crisis-deepens-new-lake-raises-fresh-risk-hundreds-still-missing" target="_blank" rel="noreferrer">Good read: Nepal flood crisis deepens as new lake raises fresh risk</a><a href="https://webfitnews.com/five-new-zealanders-reported-missing-after-deadly-nepal-tibet-border-flood" target="_blank" rel="noreferrer">Good read: Five New Zealanders reported missing after deadly Nepal-Tibet border flood</a></div>}
        {galleryMedia.length? <div className="campaign-media-grid">{galleryMedia.map((m:any)=><div className="media-card" key={m.id}>{m.kind==='image'?<img src={`/api/media/${m.id}`} alt={m.title}/>:<a className="text-link" href={m.url||'#'} target="_blank" rel="noreferrer">{m.title}</a>}<div><strong>{m.title}</strong><small>{m.kind}</small></div></div>)}</div>:slug==='nepal-flash-flood-relief-2026'?null:<p className="muted">No additional campaign media has been published yet.</p>}
      </section>

      <DonorWall donations={donations}/>

      <section className="campaign-section">
        <h2>How Good Cause protects supporters</h2>
        <div className="campaign-trust-grid">
          <div className="trust-card"><h3>Campaign review</h3><p>Campaigns must pass Good Cause review before donations can be enabled.</p></div>
          <div className="trust-card"><h3>Verified payout controls</h3><p>Payments are enabled only when required beneficiary and payout checks are satisfied.</p></div>
          <div className="trust-card"><h3>Private contact details</h3><p>Contributor email addresses and mobile numbers are securely recorded but are never published on campaign pages.</p></div>
          <div className="trust-card"><h3>Questions and concerns</h3><p>Supporters can contact Good Cause or report campaign information they believe is inaccurate or unsafe.</p></div>
        </div>
        <div className="campaign-links-row"><Link href="/how-it-works">How Good Cause works</Link><Link href="/faq">Frequently asked questions</Link><Link href="/transparency">Transparency</Link><Link href="/report">Report this campaign</Link></div>
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
