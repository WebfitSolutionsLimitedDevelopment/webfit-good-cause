import { notFound,redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/admin/AdminNav';
import { createNotification } from '@/lib/notifications';

export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const staff=await requireStaff(['reviewer','admin','super_admin']);const s=createServiceClient();
  const {data:c}=await s.from('campaigns').select('*,profiles!campaigns_owner_id_fkey(full_name,email),beneficiaries(*),payment_destinations(*)').eq('id',id).maybeSingle();if(!c)notFound();
  const [{data:checksData},{data:docsData},{data:changesData},{data:queriesData},{data:mediaData},{data:updatesData}]=await Promise.all([
    s.from('compliance_checks').select('*').eq('campaign_id',id).order('created_at'),
    s.from('verification_documents').select('id,kind,file_name,status,reviewer_note,uploaded_at').eq('campaign_id',id).order('uploaded_at',{ascending:false}),
    s.from('campaign_change_requests').select('*').eq('campaign_id',id).order('created_at',{ascending:false}),
    s.from('campaign_queries').select('*').eq('campaign_id',id).order('created_at',{ascending:false}),
    s.from('campaign_media').select('*').eq('campaign_id',id).order('created_at',{ascending:false}),
    s.from('campaign_updates').select('*').eq('campaign_id',id).order('published_at',{ascending:false})
  ]);
  const checks=checksData??[],docs=docsData??[],changes=changesData??[],queries=queriesData??[],media=mediaData??[],updates=updatesData??[];
  const ready=checks.filter((x:any)=>x.required).every((x:any)=>x.status==='verified');

  async function notifyOwner(title:string,message:string,type:string){const db=createServiceClient();const {data:campaign}=await db.from('campaigns').select('owner_id,profiles!campaigns_owner_id_fkey(email)').eq('id',id).single();const owner:any=campaign?.profiles;await createNotification({userId:campaign?.owner_id,campaignId:id,type,title,message,email:owner?.email});}

  async function campaignAction(formData:FormData){
    'use server';const current=await requireStaff(['reviewer','admin','super_admin']);const db=createServiceClient();const decision=String(formData.get('decision')||'');const reason=String(formData.get('reason')||'').trim();if(!reason)return;
    const {data:existing}=await db.from('campaigns').select('status,title,owner_id,published_at').eq('id',id).single();if(!existing)return;let to:any=existing.status;
    if(decision==='approve'){const {data:remaining}=await db.from('compliance_checks').select('id').eq('campaign_id',id).eq('required',true).neq('status','verified');if(remaining?.length)return;to='live';}
    if(decision==='request_information')to='more_information_required';if(decision==='escalate')to='enhanced_review';if(decision==='reject')to='rejected';if(decision==='suspend')to='suspended';
    await db.from('campaigns').update({status:to,approved_by:decision==='approve'?current.user.id:null,approved_at:decision==='approve'?new Date().toISOString():null,published_at:decision==='approve'?(existing.published_at||new Date().toISOString()):existing.published_at,updated_at:new Date().toISOString()}).eq('id',id);
    await db.from('review_actions').insert({campaign_id:id,reviewer_id:current.user.id,decision:decision==='approve'?'approve':decision==='request_information'?'request_information':decision==='escalate'?'escalate':decision==='suspend'?'suspend':'reject',reason,from_status:existing.status,to_status:to});
    await db.from('audit_events').insert({actor_user_id:current.user.id,campaign_id:id,event_type:`admin_${decision}`,entity_type:'campaign',entity_id:id,metadata:{reason,from:existing.status,to}});
    const {data:owner}=await db.from('profiles').select('email').eq('id',existing.owner_id).maybeSingle();await createNotification({userId:existing.owner_id,campaignId:id,type:'campaign_status_changed',title:`Good Cause campaign update: ${existing.title}`,message:`Status: ${String(to).replaceAll('_',' ')}. ${reason}`,email:owner?.email});
    revalidatePath(`/admin/campaigns/${id}`);redirect(`/admin/campaigns/${id}`);
  }

  async function checkAction(formData:FormData){
    'use server';const current=await requireStaff(['reviewer','admin','super_admin']);const db=createServiceClient();const checkId=String(formData.get('checkId'));const status=String(formData.get('status'));const note=String(formData.get('note')||'');
    await db.from('compliance_checks').update({status,reviewer_note:note,reviewed_by:current.user.id,reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',checkId).eq('campaign_id',id);
    await db.from('audit_events').insert({actor_user_id:current.user.id,campaign_id:id,event_type:'compliance_check_updated',entity_type:'compliance_check',entity_id:checkId,metadata:{status,note}});
    if(status==='needs_information')await notifyOwner('Good Cause needs more information',note||'A compliance item needs additional information.','compliance_information_required');
    revalidatePath(`/admin/campaigns/${id}`);
  }

  async function raiseQuery(formData:FormData){
    'use server';const current=await requireStaff(['reviewer','admin','super_admin']);const db=createServiceClient();const title=String(formData.get('title')||'').trim(),message=String(formData.get('message')||'').trim();if(!title||!message)return;
    const {data:q}=await db.from('campaign_queries').insert({campaign_id:id,raised_by:current.user.id,title,message,status:'open'}).select('id').single();
    await db.from('campaigns').update({status:'more_information_required',updated_at:new Date().toISOString()}).eq('id',id);
    await db.from('audit_events').insert({actor_user_id:current.user.id,campaign_id:id,event_type:'admin_query_raised',entity_type:'campaign_query',entity_id:q?.id,metadata:{title}});
    await notifyOwner(`Information required: ${title}`,message,'admin_query_raised');revalidatePath(`/admin/campaigns/${id}`);
  }

  async function resolveQuery(formData:FormData){
    'use server';const current=await requireStaff(['reviewer','admin','super_admin']);const db=createServiceClient();const queryId=String(formData.get('queryId')||'');
    await db.from('campaign_queries').update({status:'resolved',resolved_by:current.user.id,resolved_at:new Date().toISOString()}).eq('id',queryId).eq('campaign_id',id);
    await db.from('audit_events').insert({actor_user_id:current.user.id,campaign_id:id,event_type:'admin_query_resolved',entity_type:'campaign_query',entity_id:queryId,metadata:{}});revalidatePath(`/admin/campaigns/${id}`);
  }

  async function reviewChange(formData:FormData){
    'use server';const current=await requireStaff(['reviewer','admin','super_admin']);const db=createServiceClient();const requestId=String(formData.get('requestId')||'');const decision=String(formData.get('decision')||'');const note=String(formData.get('note')||'').trim();
    const {data:req}=await db.from('campaign_change_requests').select('*').eq('id',requestId).eq('campaign_id',id).eq('status','pending').maybeSingle();if(!req)return;
    if(decision==='approve'){const proposed:any=req.proposed_changes||{};const {data:campaign}=await db.from('campaigns').select('beneficiary_id,payment_destination_id').eq('id',id).single();if(proposed.campaign)await db.from('campaigns').update({...proposed.campaign,updated_at:new Date().toISOString()}).eq('id',id);if(proposed.beneficiary&&campaign?.beneficiary_id)await db.from('beneficiaries').update({...proposed.beneficiary,identity_status:'pending',consent_status:'pending',updated_at:new Date().toISOString()}).eq('id',campaign.beneficiary_id);if(proposed.payment_destination&&campaign?.payment_destination_id)await db.from('payment_destinations').update({...proposed.payment_destination,verification_status:'pending',last_verified_at:null}).eq('id',campaign.payment_destination_id);if(proposed.beneficiary||proposed.payment_destination){await db.from('compliance_checks').update({status:'pending',reviewer_note:'Reverification required after approved sensitive campaign change.',reviewed_by:null,reviewed_at:null,updated_at:new Date().toISOString()}).eq('campaign_id',id).in('check_key',['beneficiary','beneficiary_consent','payment_destination']);}}
    await db.from('campaign_change_requests').update({status:decision==='approve'?'approved':'rejected',admin_note:note||null,reviewed_by:current.user.id,reviewed_at:new Date().toISOString()}).eq('id',requestId);
    await db.from('audit_events').insert({actor_user_id:current.user.id,campaign_id:id,event_type:`campaign_change_${decision}`,entity_type:'campaign_change_request',entity_id:requestId,metadata:{note,changes:req.proposed_changes}});
    await notifyOwner(`Campaign changes ${decision==='approve'?'approved':'not approved'}`,note||`Your requested campaign changes were ${decision==='approve'?'approved and published':'not approved'}.`,'campaign_change_reviewed');revalidatePath(`/admin/campaigns/${id}`);
  }

  async function reviewMedia(formData:FormData){
    'use server';const current=await requireStaff(['reviewer','admin','super_admin']);const db=createServiceClient();const mediaId=String(formData.get('mediaId')||'');const decision=String(formData.get('decision')||'');const note=String(formData.get('note')||'').trim();
    const {data:mediaItem}=await db.from('campaign_media').select('is_primary').eq('id',mediaId).maybeSingle();if(decision==='approve'&&mediaItem?.is_primary)await db.from('campaign_media').update({is_primary:false}).eq('campaign_id',id).eq('status','approved').neq('id',mediaId);await db.from('campaign_media').update({status:decision==='approve'?'approved':'rejected',reviewer_note:note||null,reviewed_by:current.user.id,reviewed_at:new Date().toISOString()}).eq('id',mediaId).eq('campaign_id',id);
    await db.from('audit_events').insert({actor_user_id:current.user.id,campaign_id:id,event_type:`campaign_media_${decision}`,entity_type:'campaign_media',entity_id:mediaId,metadata:{note}});await notifyOwner(`Campaign media ${decision==='approve'?'approved':'not approved'}`,note||'Your media submission has been reviewed.','campaign_media_reviewed');revalidatePath(`/admin/campaigns/${id}`);
  }

  async function reviewUpdate(formData:FormData){
    'use server';const current=await requireStaff(['reviewer','admin','super_admin']);const db=createServiceClient();const updateId=String(formData.get('updateId')||'');const decision=String(formData.get('decision')||'');const note=String(formData.get('note')||'').trim();
    await db.from('campaign_updates').update({status:decision==='approve'?'approved':'rejected',reviewer_note:note||null,reviewed_by:current.user.id,reviewed_at:new Date().toISOString(),published_at:decision==='approve'?new Date().toISOString():new Date().toISOString()}).eq('id',updateId).eq('campaign_id',id);
    await db.from('audit_events').insert({actor_user_id:current.user.id,campaign_id:id,event_type:`campaign_update_${decision}`,entity_type:'campaign_update',entity_id:updateId,metadata:{note}});await notifyOwner(`Campaign update ${decision==='approve'?'approved':'not approved'}`,note||'Your campaign update has been reviewed.','campaign_update_reviewed');revalidatePath(`/admin/campaigns/${id}`);
  }

  return <section className="section"><div className="shell"><h1>{c.title}</h1><p className="muted">{c.reference_code} · Owner: {c.profiles?.full_name||c.profiles?.email}</p><AdminNav/><div className="dashboard-toolbar"><a className="button secondary" href={`/admin/campaigns/${id}/edit`}>Master edit</a></div><div className="case-layout"><main>
    <div className="card case-card"><h2>Campaign details</h2><div className="review-list"><div><span>Status</span><strong>{String(c.status).replaceAll('_',' ')}</strong></div><div><span>Risk</span><strong>{c.risk_level}</strong></div><div><span>Beneficiary</span><strong>{c.beneficiaries?.display_name||'Not set'}</strong></div><div><span>Payment destination</span><strong>{c.payment_destinations?.account_holder_name||'Not set'}</strong></div><div><span>Target</span><strong>{c.target_cents?`NZ$${(c.target_cents/100).toLocaleString()}`:'No fixed target'}</strong></div></div><h3>Story and purpose</h3><p>{c.story}</p></div>
    <div className="card case-card"><h2>Pending organiser changes</h2>{changes.filter((x:any)=>x.status==='pending').length===0?<p className="muted">No pending changes.</p>:changes.filter((x:any)=>x.status==='pending').map((r:any)=><form action={reviewChange} className="compliance-admin-row" key={r.id}><div><strong>{r.summary||'Campaign details'}</strong><span><code>{JSON.stringify(r.proposed_changes)}</code></span></div><input type="hidden" name="requestId" value={r.id}/><input name="note" placeholder="Approval/rejection note"/><button className="button small" name="decision" value="approve">Approve</button><button className="button small secondary" name="decision" value="reject">Reject</button></form>)}</div>
    <div className="card case-card"><h2>Compliance checklist</h2>{checks.map((x:any)=><form action={checkAction} className="compliance-admin-row" key={x.id}><div><strong>{x.label}</strong><span>{x.reviewer_note||'No reviewer note'}</span></div><input type="hidden" name="checkId" value={x.id}/><select name="status" defaultValue={x.status}><option value="pending">Pending</option><option value="verified">Verified</option><option value="needs_information">Needs information</option><option value="failed">Failed</option><option value="expired">Expired</option></select><input name="note" defaultValue={x.reviewer_note||''} placeholder="Reviewer note"/><button className="button small">Save</button></form>)}</div>
    <div className="card case-card"><h2>Queries and missing information</h2><form action={raiseQuery} className="form"><label>Query/checklist item<input name="title" placeholder="e.g. Proof of beneficiary consent" required/></label><label>What is required?<textarea name="message" rows={4} required/></label><button className="button">Raise query</button></form>{queries.map((q:any)=><div className="task-row" key={q.id}><div><strong>{q.title}</strong><span>{q.message}{q.fundraiser_response?` · Response: ${q.fundraiser_response}`:''}</span></div>{q.status!=='resolved'?<form action={resolveQuery}><input type="hidden" name="queryId" value={q.id}/><button className="button small secondary">Resolve</button></form>:<b>Resolved</b>}</div>)}</div>
    <div className="card case-card"><h2>Verification documents</h2>{docs.length===0?<p className="muted">No documents uploaded.</p>:docs.map((d:any)=><div className="task-row" key={d.id}><div><strong>{d.file_name}</strong><span>{d.kind} · {d.status}</span></div><a className="button small secondary" href={`/api/admin/documents/${d.id}`}>Open securely</a></div>)}</div>
    <div className="card case-card"><h2>Campaign media awaiting approval</h2>{media.filter((m:any)=>m.status==='pending').length===0?<p className="muted">No pending media.</p>:media.filter((m:any)=>m.status==='pending').map((m:any)=><form action={reviewMedia} className="compliance-admin-row" key={m.id}><div><strong>{m.title}</strong><span>{m.kind}{m.is_primary?' · campaign cover':''}{m.file_name?` · ${m.file_name}`:''} · <a className="text-link" href={`/api/admin/media/${m.id}`} target="_blank">Open media</a></span></div><input type="hidden" name="mediaId" value={m.id}/><input name="note" placeholder="Reviewer note"/><button className="button small" name="decision" value="approve">Approve</button><button className="button small secondary" name="decision" value="reject">Reject</button></form>)}</div>
    <div className="card case-card"><h2>Campaign updates awaiting approval</h2>{updates.filter((u:any)=>u.status==='pending').length===0?<p className="muted">No pending updates.</p>:updates.filter((u:any)=>u.status==='pending').map((u:any)=><form action={reviewUpdate} className="compliance-admin-row" key={u.id}><div><strong>{u.title}</strong><span>{u.body}</span></div><input type="hidden" name="updateId" value={u.id}/><input name="note" placeholder="Reviewer note"/><button className="button small" name="decision" value="approve">Approve</button><button className="button small secondary" name="decision" value="reject">Reject</button></form>)}</div>
  </main><aside><div className="card case-card"><h2>Review decision</h2><p className="muted">Campaign approval is blocked until all required compliance checks are verified.</p><form action={campaignAction} className="form"><label>Decision<select name="decision"><option value="approve">Approve / publish</option><option value="request_information">More information required</option><option value="escalate">Enhanced review</option><option value="suspend">Suspend</option><option value="reject">Reject</option></select></label><label>Reason / message<textarea name="reason" rows={6} required/></label><button className="button" >Submit decision</button>{!ready&&<p className="fineprint">Approval stays locked until required checks are verified. Other review actions remain available through the checklist and query controls.</p>}</form></div></aside></div></div></section>;
}
