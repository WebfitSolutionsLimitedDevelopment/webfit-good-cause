import { notFound,redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { notifyAdmins } from '@/lib/notifications';

export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const {user,profile}=await requireUser();const s=createServiceClient();const isSuperAdmin=profile?.role==='super_admin';
  let campaignQuery=s.from('campaigns').select('*,beneficiaries(display_name,legal_name,country_code),payment_destinations(account_holder_name,bank_name,bank_account_number)').eq('id',id);
  if(!isSuperAdmin)campaignQuery=campaignQuery.eq('owner_id',user.id);
  const {data:c}=await campaignQuery.maybeSingle();if(!c)notFound();
  const {data:pendingData}=isSuperAdmin?{data:[]}:await s.from('campaign_change_requests').select('*').eq('campaign_id',id).eq('status','pending').order('created_at',{ascending:false});const pending=pendingData??[];

  async function save(formData:FormData){
    'use server';const {user,profile}=await requireUser();const db=createServiceClient();const isSuperAdmin=profile?.role==='super_admin';
    let existingQuery=db.from('campaigns').select('*,beneficiaries(display_name,legal_name,country_code),payment_destinations(account_holder_name,bank_name,bank_account_number)').eq('id',id);
    if(!isSuperAdmin)existingQuery=existingQuery.eq('owner_id',user.id);
    const {data:existing}=await existingQuery.maybeSingle();if(!existing)return;
    const campaignPatch={title:String(formData.get('title')||'').trim(),summary:String(formData.get('summary')||'').trim(),story:String(formData.get('story')||'').trim(),category:String(formData.get('category')||'').trim(),location:String(formData.get('location')||'').trim(),target_cents:Math.max(100,Math.round(Number(formData.get('target')||0)*100))};
    const beneficiaryPatch={display_name:String(formData.get('beneficiary')||'').trim(),legal_name:String(formData.get('beneficiaryLegal')||'').trim(),country_code:String(formData.get('beneficiaryCountry')||'NZ').trim().toUpperCase()};
    const paymentPatch={account_holder_name:String(formData.get('paymentName')||'').trim(),bank_name:String(formData.get('bankName')||'').trim(),bank_account_number:String(formData.get('bankAccountNumber')||'').trim()};
    const currentBeneficiary:any=(existing as any).beneficiaries||{};const currentPayment:any=(existing as any).payment_destinations||{};
    const campaignChanges=Object.fromEntries(Object.entries(campaignPatch).filter(([k,v])=>String(v??'')!==String((existing as any)[k]??'')));
    const beneficiaryChanges=Object.fromEntries(Object.entries(beneficiaryPatch).filter(([k,v])=>String(v??'')!==String(currentBeneficiary[k]??'')));
    const paymentChanges=Object.fromEntries(Object.entries(paymentPatch).filter(([k,v])=>String(v??'')!==String(currentPayment[k]??'')));
    const proposed:any={};if(Object.keys(campaignChanges).length)proposed.campaign=campaignChanges;if(Object.keys(beneficiaryChanges).length)proposed.beneficiary=beneficiaryChanges;if(Object.keys(paymentChanges).length)proposed.payment_destination=paymentChanges;
    if(Object.keys(proposed).length===0)redirect(`/dashboard/campaigns/${id}`);

    if(isSuperAdmin||existing.status==='draft'){
      if(proposed.campaign)await db.from('campaigns').update({...proposed.campaign,updated_at:new Date().toISOString()}).eq('id',id);
      if(proposed.beneficiary&&existing.beneficiary_id)await db.from('beneficiaries').update({...proposed.beneficiary,updated_at:new Date().toISOString()}).eq('id',existing.beneficiary_id);
      if(proposed.payment_destination&&existing.payment_destination_id)await db.from('payment_destinations').update(proposed.payment_destination).eq('id',existing.payment_destination_id);
      await db.from('audit_events').insert({actor_user_id:user.id,campaign_id:id,event_type:isSuperAdmin?'super_admin_campaign_updated':'draft_campaign_updated',entity_type:'campaign',entity_id:id,metadata:{sections:Object.keys(proposed),direct_publish:isSuperAdmin}});
    }else{
      const sensitive=Boolean(proposed.beneficiary||proposed.payment_destination);const summary=`Requested changes to ${Object.keys(proposed).map(x=>x.replaceAll('_',' ')).join(', ')}`;
      const {data:req}=await db.from('campaign_change_requests').insert({campaign_id:id,requester_id:user.id,change_type:sensitive?'sensitive_campaign_change':'campaign_details',proposed_changes:proposed,summary}).select('id').single();
      if(sensitive&&existing.payment_destination_id)await db.from('payouts').update({status:'held'}).eq('campaign_id',id).in('status',['pending','under_review','approved']);
      await db.from('audit_events').insert({actor_user_id:user.id,campaign_id:id,event_type:'campaign_change_requested',entity_type:'campaign_change_request',entity_id:req?.id,metadata:{sections:Object.keys(proposed),sensitive}});
      await notifyAdmins({campaignId:id,type:'campaign_change_requested',title:`Campaign change awaiting approval: ${existing.reference_code}`,message:`${existing.title} has been edited by the organiser${sensitive?' and includes beneficiary or payout information':''}. The approved public campaign has not changed. Review the request before publishing.`});
    }
    revalidatePath(`/dashboard/campaigns/${id}`);revalidatePath(`/campaigns/${existing.slug}`);revalidatePath('/');redirect(`/dashboard/campaigns/${id}`);
  }

  return <section className="cms-section"><div className="shell"><div className="cms-editor-head"><div><div className="eyebrow">{c.reference_code}</div><h1>Edit campaign</h1><p>{isSuperAdmin?'Changes made here publish directly to the live campaign.':'Update your campaign information. Live campaign changes are submitted for review.'}</p></div><button form="campaign-editor" className="button">{isSuperAdmin?'Save and publish':c.status==='draft'?'Save draft':'Submit changes'}</button></div><form id="campaign-editor" action={save} className="cms-editor-grid"><main className="card cms-editor-card"><div className="cms-form-section"><span className="cms-kicker">Public campaign</span><h2>Campaign content</h2><label>Title<input name="title" defaultValue={c.title} required/></label><label>Summary<textarea name="summary" rows={3} defaultValue={c.summary} required/></label><label>Story and use of funds<textarea name="story" rows={16} defaultValue={c.story} required/></label><div className="field-grid"><label>Category<input name="category" defaultValue={c.category} required/></label><label>Location<input name="location" defaultValue={c.location||''}/></label></div><label>Target amount, NZD<input name="target" type="number" min="1" defaultValue={c.target_cents?c.target_cents/100:1}/></label></div></main><aside className="card cms-editor-card"><div className="cms-form-section"><span className="cms-kicker">Administration</span><h2>Beneficiary and payout</h2><label>Public beneficiary name<input name="beneficiary" defaultValue={c.beneficiaries?.display_name||''}/></label><label>Legal beneficiary name<input name="beneficiaryLegal" defaultValue={c.beneficiaries?.legal_name||''}/></label><label>Country code<input name="beneficiaryCountry" defaultValue={c.beneficiaries?.country_code||'NZ'}/></label><label>Payout account holder<input name="paymentName" defaultValue={c.payment_destinations?.account_holder_name||''}/></label><label>Bank name<input name="bankName" defaultValue={c.payment_destinations?.bank_name||''}/></label><label>Bank account number<input name="bankAccountNumber" defaultValue={c.payment_destinations?.bank_account_number||''}/></label>{isSuperAdmin?<div className="cms-info-box"><strong>Super Admin direct edit</strong><span>No approval queue is created for your changes. All edits are written to the audit log.</span></div>:<div className="notice warning"><strong>Sensitive changes require review.</strong><br/>Beneficiary or payout changes can place pending payouts on hold until reverification is complete.</div>}<button className="button cms-mobile-save">{isSuperAdmin?'Save and publish':c.status==='draft'?'Save draft':'Submit changes'}</button></div></aside></form>{pending.length>0&&<div className="card cms-panel"><h2>Pending change requests</h2>{pending.map((r:any)=><div className="task-row" key={r.id}><div><strong>{r.summary||'Campaign changes'}</strong><span>Submitted {new Date(r.created_at).toLocaleString('en-NZ')}</span></div><b>Pending approval</b></div>)}</div>}</div></section>;
}
