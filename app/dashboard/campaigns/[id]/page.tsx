import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { DocumentUploader } from '@/components/dashboard/DocumentUploader';
import { MediaManager } from '@/components/dashboard/MediaManager';

export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const {user}=await requireUser();const s=createServiceClient();
  const {data:c}=await s.from('campaigns').select('*, beneficiaries(display_name,consent_status,identity_status), payment_destinations(account_holder_name,verification_status)').eq('id',id).eq('owner_id',user.id).maybeSingle();if(!c)notFound();
  const [{data:checksData},{data:docsData},{data:changeData},{data:queryData},{data:mediaData}]=await Promise.all([
    s.from('compliance_checks').select('*').eq('campaign_id',id).order('created_at'),
    s.from('verification_documents').select('id,kind,file_name,status,uploaded_at').eq('campaign_id',id).order('uploaded_at',{ascending:false}),
    s.from('campaign_change_requests').select('*').eq('campaign_id',id).order('created_at',{ascending:false}).limit(20),
    s.from('campaign_queries').select('*').eq('campaign_id',id).order('created_at',{ascending:false}),
    s.from('campaign_media').select('id,kind,title,status,reviewer_note,created_at').eq('campaign_id',id).order('created_at',{ascending:false})
  ]);
  const checks=checksData??[],docs=docsData??[],changes=changeData??[],queries=queryData??[],media=mediaData??[];
  return <><section className="page-hero dashboard-hero"><div className="shell"><div className="eyebrow">{c.reference_code}</div><h1>{c.title}</h1><span className={`status-pill ${c.risk_level}`}>{String(c.status).replaceAll('_',' ')}</span></div></section><section className="section dashboard-section"><div className="shell"><div className="dashboard-toolbar"><Link className="button secondary" href={`/dashboard/campaigns/${id}/edit`}>Edit campaign</Link><Link className="button secondary" href={`/dashboard/campaigns/${id}/updates`}>Updates</Link><Link className="button secondary" href={`/dashboard/campaigns/${id}/donations`}>Donations</Link><Link className="button secondary" href={`/dashboard/campaigns/${id}/payouts`}>Payouts</Link></div><div className="dashboard-layout"><main>
    {queries.some((q:any)=>q.status==='open')&&<div className="card checklist-card"><h2>Information requested by Good Cause</h2>{queries.filter((q:any)=>q.status==='open').map((q:any)=><div className="task-row" key={q.id}><div><strong>{q.title}</strong><span>{q.message}</span></div><Link className="button small" href={`/dashboard/campaigns/${id}/queries`}>Respond</Link></div>)}</div>}
    <div className="card checklist-card"><h2>Compliance progress</h2>{checks.map((x:any)=><div className="task-row" key={x.id}><div><strong>{x.label}</strong><span>{x.reviewer_note||'Review in progress'}</span></div><b className={`check-state ${x.status}`}>{String(x.status).replaceAll('_',' ')}</b></div>)}</div>
    <div className="card checklist-card"><h2>Pending and recent changes</h2>{changes.length===0?<p className="muted">No campaign change requests yet.</p>:changes.map((r:any)=><div className="task-row" key={r.id}><div><strong>{r.summary||'Campaign change'}</strong><span>{r.admin_note||`Submitted ${new Date(r.created_at).toLocaleString('en-NZ')}`}</span></div><b>{r.status}</b></div>)}</div>
    <div className="card checklist-card"><h2>Campaign media</h2>{media.length===0?<p className="muted">No media submitted yet.</p>:media.map((m:any)=><div className="task-row" key={m.id}><div><strong>{m.title}</strong><span>{m.kind}{m.reviewer_note?` · ${m.reviewer_note}`:''}</span></div><b>{m.status}</b></div>)}</div>
    <div className="card checklist-card"><h2>Verification documents</h2>{docs.length===0?<p className="muted">No documents uploaded yet.</p>:docs.map((d:any)=><div className="task-row" key={d.id}><div><strong>{d.file_name}</strong><span>{String(d.kind).replaceAll('_',' ')}</span></div><b>{d.status}</b></div>)}</div>
  </main><aside><DocumentUploader campaignId={id}/><MediaManager campaignId={id}/><div className="card manage-card"><h3>Approval control</h3><p className="muted">After submission, any change to campaign text, target, location, image, media or public information is held for Good Cause approval. The approved public version stays unchanged until review is complete.</p></div></aside></div></div></section></>;
}
