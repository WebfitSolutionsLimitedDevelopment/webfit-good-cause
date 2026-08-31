import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';

export default async function Dashboard(){
  const {user,profile}=await requireUser();
  const s=createServiceClient();
  const isSuperAdmin=profile?.role==='super_admin';
  let query=s.from('campaigns').select('id,title,slug,reference_code,status,target_cents,created_at,owner_id').order('created_at',{ascending:false});
  if(!isSuperAdmin)query=query.eq('owner_id',user.id);
  const {data:campaignsData}=await query;
  const campaigns=campaignsData??[];

  return <>
    <section className="cms-admin-header"><div className="shell cms-admin-header-row"><div><div className="eyebrow">{isSuperAdmin?'Good Cause CMS':'Fundraiser dashboard'}</div><h1>{isSuperAdmin?'Campaign management':'My campaigns'}</h1><p>{isSuperAdmin?'Manage campaign content, images, donations, updates and payouts.':'Manage your campaigns, updates and payout progress.'}</p></div>{isSuperAdmin&&<span className="cms-role-badge">Super Admin</span>}</div></section>
    <section className="cms-section"><div className="shell">
      <div className="cms-toolbar professional"><div><Link className="button" href="/start">Create campaign</Link><Link className="button secondary" href="/dashboard/notifications">Notifications</Link>{isSuperAdmin&&<Link className="button secondary" href="/admin">Admin centre</Link>}</div></div>
      {campaigns.length===0?<div className="card empty-state"><h2>No campaigns yet</h2><p>Create your first cause.</p><Link className="button" href="/start">Start a cause</Link></div>:
      <div className="cms-table-card">
        <div className="cms-table-head"><span>Campaign</span><span>Status</span><span>Target</span><span>Reference</span><span></span></div>
        {campaigns.map((c:any)=><div className="cms-table-row" key={c.id}>
          <div className="cms-campaign-name"><strong>{c.title}</strong><a href={`/campaigns/${c.slug}`} target="_blank" rel="noreferrer">View public page</a></div>
          <div><span className={`cms-status ${String(c.status)}`}>{String(c.status).replaceAll('_',' ')}</span></div>
          <div className="cms-table-value">{c.target_cents?`NZ$${(Number(c.target_cents)/100).toLocaleString()}`:'No fixed target'}</div>
          <div className="cms-table-value">{c.reference_code||'Not assigned'}</div>
          <div className="cms-row-actions"><Link className="button secondary small" href={`/dashboard/campaigns/${c.id}`}>Manage</Link><Link className="button small" href={`/dashboard/campaigns/${c.id}/edit`}>Edit</Link></div>
        </div>)}
      </div>}
    </div></section>
  </>;
}
