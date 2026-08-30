import { notFound,redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { notifyAdmins } from '@/lib/notifications';

export default async function Page({params}:{params:Promise<{id:string}>}){
  const {id}=await params;const {user}=await requireUser();const s=createServiceClient();
  const {data:c}=await s.from('campaigns').select('*,beneficiaries(display_name,legal_name,country_code),payment_destinations(account_holder_name,bank_name,bank_account_number)').eq('id',id).eq('owner_id',user.id).maybeSingle();if(!c)notFound();
  const {data:pendingData}=await s.from('campaign_change_requests').select('*').eq('campaign_id',id).eq('status','pending').order('created_at',{ascending:false});const pending=pendingData??[];

  async function save(formData:FormData){
    'use server';const {user}=await requireUser();const db=createServiceClient();const {data:existing}=await db.from('campaigns').select('*,beneficiaries(display_name,legal_name,country_code),payment_destinations(account_holder_name,bank_name,bank_account_number)').eq('id',id).eq('owner_id',user.id).maybeSingle();if(!existing)return;
    const campaignPatch={title:String(formData.get('title')||'').trim(),summary:String(formData.get('summary')||'').trim(),story:String(formData.get('story')||'').trim(),category:String(formData.get('category')||'').trim(),location:String(formData.get('location')||'').trim(),target_cents:Math.max(100,Math.round(Number(formData.get('target')||0)*100))};
    const beneficiaryPatch={display_name:String(formData.get('beneficiary')||'').trim(),legal_name:String(formData.get('beneficiaryLegal')||'').trim(),country_code:String(formData.get('beneficiaryCountry')||'NZ').trim().toUpperCase()};
    const paymentPatch={account_holder_name:String(formData.get('paymentName')||'').trim(),bank_name:String(formData.get('bankName')||'').trim(),bank_account_number:String(formData.get('bankAccountNumber')||'').trim()};
    if(!campaignPatch.title||!campaignPatch.summary||!campaignPatch.story||!campaignPatch.category||!beneficiaryPatch.display_name||!paymentPatch.account_holder_name||!paymentPatch.bank_name||!paymentPatch.bank_account_number)return;
    const currentBeneficiary:any=(existing as any).beneficiaries||{};const currentPayment:any=(existing as any).payment_destinations||{};
    const campaignChanges=Object.fromEntries(Object.entries(campaignPatch).filter(([k,v])=>String(v??'')!==String((existing as any)[k]??'')));
    const beneficiaryChanges=Object.fromEntries(Object.entries(beneficiaryPatch).filter(([k,v])=>String(v??'')!==String(currentBeneficiary[k]??'')));
    const paymentChanges=Object.fromEntries(Object.entries(paymentPatch).filter(([k,v])=>String(v??'')!==String(currentPayment[k]??'')));
    const proposed:any={};if(Object.keys(campaignChanges).length)proposed.campaign=campaignChanges;if(Object.keys(beneficiaryChanges).length)proposed.beneficiary=beneficiaryChanges;if(Object.keys(paymentChanges).length)proposed.payment_destination=paymentChanges;
    if(Object.keys(proposed).length===0)redirect(`/dashboard/campaigns/${id}`);
    if(existing.status==='draft'){
      if(proposed.campaign)await db.from('campaigns').update({...proposed.campaign,updated_at:new Date().toISOString()}).eq('id',id);
      if(proposed.beneficiary&&existing.beneficiary_id)await db.from('beneficiaries').update({...proposed.beneficiary,updated_at:new Date().toISOString()}).eq('id',existing.beneficiary_id);
      if(proposed.payment_destination&&existing.payment_destination_id)await db.from('payment_destinations').update(proposed.payment_destination).eq('id',existing.payment_destination_id);
      await db.from('audit_events').insert({actor_user_id:user.id,campaign_id:id,event_type:'draft_campaign_updated',entity_type:'campaign',entity_id:id,metadata:{sections:Object.keys(proposed)}});
    }else{
      const sensitive=Boolean(proposed.beneficiary||proposed.payment_destination);const summary=`Requested changes to ${Object.keys(proposed).map(x=>x.replaceAll('_',' ')).join(', ')}`;
      const {data:req}=await db.from('campaign_change_requests').insert({campaign_id:id,requester_id:user.id,change_type:sensitive?'sensitive_campaign_change':'campaign_details',proposed_changes:proposed,summary}).select('id').single();
      if(sensitive&&existing.payment_destination_id)await db.from('payouts').update({status:'held'}).eq('campaign_id',id).in('status',['pending','under_review','approved']);
      await db.from('audit_events').insert({actor_user_id:user.id,campaign_id:id,event_type:'campaign_change_requested',entity_type:'campaign_change_request',entity_id:req?.id,metadata:{sections:Object.keys(proposed),sensitive}});
      await notifyAdmins({campaignId:id,type:'campaign_change_requested',title:`Campaign change awaiting approval: ${existing.reference_code}`,message:`${existing.title} has been edited by the organiser${sensitive?' and includes beneficiary or payout information':''}. The approved public campaign has not changed. Review the request before publishing.`});
    }
    revalidatePath(`/dashboard/campaigns/${id}`);redirect(`/dashboard/campaigns/${id}`);
  }

  return <section className="section"><div className="shell"><form action={save} className="form card manage-card"><h1>Edit campaign</h1><p className="muted">After submission, every change is held for Good Cause approval. Your current approved campaign stays public while the proposed version is reviewed.</p><label>Title<input name="title" defaultValue={c.title} required/></label><label>Summary<textarea name="summary" rows={3} defaultValue={c.summary} required/></label><label>Story and use of funds<textarea name="story" rows={12} defaultValue={c.story} required/></label><div className="field-grid"><label>Category<input name="category" defaultValue={c.category} required/></label><label>Location<input name="location" defaultValue={c.location||''}/></label></div><label>Target amount, NZD<input name="target" type="number" min="1" defaultValue={c.target_cents?c.target_cents/100:1}/></label><h2>Beneficiary details</h2><div className="field-grid"><label>Public beneficiary name<input name="beneficiary" defaultValue={c.beneficiaries?.display_name||''} required/></label><label>Legal beneficiary name<input name="beneficiaryLegal" defaultValue={c.beneficiaries?.legal_name||''}/></label><label>Country code<input name="beneficiaryCountry" defaultValue={c.beneficiaries?.country_code||'NZ'} required/></label><label>Payout account holder<input name="paymentName" defaultValue={c.payment_destinations?.account_holder_name||''} required/></label><label>Bank name<input name="bankName" defaultValue={c.payment_destinations?.bank_name||''} required/></label><label>Bank account number<input name="bankAccountNumber" defaultValue={c.payment_destinations?.bank_account_number||''} required/></label></div><div className="notice warning"><strong>Sensitive changes are never automatic.</strong><br/>Beneficiary or payout-destination changes are sent for enhanced admin review and can place pending payouts on hold until reverification is complete.</div><button className="button">{c.status==='draft'?'Save draft':'Submit changes for approval'}</button></form>{pending.length>0&&<div className="card manage-card" style={{marginTop:24}}><h2>Pending change requests</h2>{pending.map((r:any)=><div className="task-row" key={r.id}><div><strong>{r.summary||'Campaign changes'}</strong><span>Submitted {new Date(r.created_at).toLocaleString('en-NZ')}</span></div><b>Pending approval</b></div>)}</div>}</div></section>;
}
