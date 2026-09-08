import Link from 'next/link';
import { PublicCampaign } from '@/lib/public-campaigns';
import { money } from '@/lib/fees';

function timeAgo(value:string|null){
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
  return `${days} day${days===1?'':'s'} ago`;
}

export function CampaignCard({campaign}:{campaign:PublicCampaign}){
  const pct=campaign.goal>0?Math.min(100,Math.round(campaign.raised/campaign.goal*100)):0;
  const latest=timeAgo(campaign.lastContributionAt);
  return <article className="campaign-card polished-card live-campaign-card">
    <div className="campaign-visual campaign-photo">
      {campaign.coverMediaId?<img src={`/api/media/${campaign.coverMediaId}`} alt={campaign.title}/>:campaign.slug==='nepal-flash-flood-relief-2026'?<img src="/campaigns/nepal-flash-flood-relief-2026.png" alt="Flood damage in Nepal"/>:<div className="campaign-cover-fallback" aria-hidden="true"/>}
      <div className="campaign-chip">{campaign.category}</div>
      <div className="live-badge"><span className="live-dot"/>Live</div>
    </div>
    <div className="card-body">
      <div className="eyebrow">{campaign.location}</div>
      <h3><Link href={`/campaigns/${campaign.slug}`}>{campaign.title}</Link></h3>
      <p>{campaign.summary}</p>
      <div className="progress"><i style={{width:`${pct}%`}}/></div>
      <div className="campaign-stats"><strong>{money(campaign.raised)}</strong><span>{campaign.goal>0?`raised of ${money(campaign.goal)}`:'raised'}</span></div>
      <div className="campaign-card-progress-meta"><span>{campaign.donors} supporter{campaign.donors===1?'':'s'}</span>{campaign.goal>0&&<span>{pct}% funded</span>}</div>
      <div className="campaign-card-activity">
        <span className="activity-pulse" aria-hidden="true"/>
        <span>{latest?`Latest support ${latest}`:'Ready for support'}</span>
      </div>
      <div className="card-meta"><span>Good Cause reviewed</span>{campaign.beneficiaryVerified&&<span>Beneficiary verified</span>}</div>
      <Link className="text-cta" href={`/campaigns/${campaign.slug}`}>View cause and donate</Link>
    </div>
  </article>;
}
