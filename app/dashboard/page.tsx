import Link from 'next/link';
import { requireUser, canManageCampaign } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard(){
  const {user,profile}=await requireUser();
  const s=createServiceClient();
  const role=profile?.role as string|undefined;
  const canSeeAll=canManageCampaign(role);
  const isSuperAdmin=role==='super_admin';

  let query=s.from('campaigns')
    .select('id,title,slug,reference_code,status,risk_level,target_cents,created_at,owner_id,published_at')
    .order('created_at',{ascending:false});
  if(!canSeeAll)query=query.eq('owner_id',user.id);

  const {data:campaignsData,error}=await query;
  const campaigns=campaignsData??[];

  return <>
    <section className="cms-hero"><div className="shell"><div className="cms-hero-row"><div>
      <div className="eyebrow">{canSeeAll?'Good Cause CMS':'Fundraiser dashboard'}</div>
      <h1>{canSeeAll?'Campaign management':'Your campaigns'}</h1>
      <p>{canSeeAll?'Manage live and draft campaigns, content, media, donations and payouts from one place.':'Manage your campaigns, updates and payout progress.'}</p>
    </div>{isSuperAdmin&&<span className="cms-role-badge">Super Admin</span>}</div></div></section>

    <section className="cms-section"><div className="shell">
      <div className="cms-toolbar"><div>
        <Link className="button" href="/start">Start a new cause</Link>{' '}
        <Link className="button secondary" href="/dashboard/notifications">Notifications</Link>{' '}
        {canSeeAll&&<Link className="button secondary" href="/admin">Admin centre</Link>}
      </div><form action="/auth/signout" method="post"><button className="button secondary">Log out</button></form></div>

      {error?<div className="card empty-state"><h2>Campaigns could not be loaded</h2><p>{error.message}</p></div>:
      campaigns.length===0?<div className="card empty-state"><h2>No campaigns found</h2><p>{canSeeAll?'There are no campaigns in the production database.':'Create your first cause.'}</p></div>:
      <div className="cms-campaign-grid">{campaigns.map((c:any)=><article className="card cms-campaign-card" key={c.id}>
        <div className="cms-campaign-top"><span className={`status-pill ${c.risk_level}`}>{String(c.status).replaceAll('_',' ')}</span><span className="cms-reference">{c.reference_code}</span></div>
        <h3>{c.title}</h3>
        <p>{c.target_cents?`Target NZ$${(Number(c.target_cents)/100).toLocaleString('en-NZ')}`:'No fixed target'}</p>
        <div className="cms-card-actions"><Link className="button small" href={`/dashboard/campaigns/${c.id}`}>{canSeeAll?'Open CMS':'Manage'}</Link>{c.status==='live'&&<Link className="button secondary small" href={`/campaigns/${c.slug}`} target="_blank">View live</Link>}</div>
      </article>)}</div>}
    </div></section>
  </>;
}
