import { createServiceClient } from './supabase-server';
import { sendEmail, workflowEmailHtml } from './email';
import { SITE } from './constants';

function absolute(path?:string|null){
  if(!path) return `${SITE.url.replace(/\/$/,'')}/dashboard/notifications`;
  return path.startsWith('http')?path:`${SITE.url.replace(/\/$/,'')}${path}`;
}

export async function createNotification(input:{userId?:string|null;campaignId?:string|null;type:string;title:string;message:string;email?:string|null;link?:string|null;ctaLabel?:string;reference?:string|null}){
  const db=createServiceClient();
  if(input.userId){
    const {error}=await db.from('notifications').insert({user_id:input.userId,campaign_id:input.campaignId||null,type:input.type,title:input.title,message:input.message});
    if(error) console.error('notification_insert_failed',{type:input.type,error:error.message});
  }
  if(input.email){
    const link=absolute(input.link);
    await sendEmail({
      to:input.email,
      subject:input.title,
      html:workflowEmailHtml({heading:input.title,message:input.message,ctaLabel:input.ctaLabel||'Sign in to Good Cause',ctaUrl:link,reference:input.reference}),
      text:`${input.message}\n\n${link}`,
    }).catch(error=>console.error('notification_email_failed',{type:input.type,error:String(error)}));
  }
}

/** Notify a campaign owner in the dashboard and by email. */
export async function notifyCampaignOwner(input:{campaignId:string;type:string;title:string;message:string;link?:string;ctaLabel?:string}){
  const db=createServiceClient();
  const {data:campaign}=await db.from('campaigns').select('owner_id,reference_code').eq('id',input.campaignId).maybeSingle();
  if(!campaign?.owner_id) return;
  const {data:owner}=await db.from('profiles').select('email').eq('id',campaign.owner_id).maybeSingle();
  await createNotification({userId:campaign.owner_id,campaignId:input.campaignId,type:input.type,title:input.title,message:input.message,email:owner?.email||null,link:input.link||`/dashboard/campaigns/${input.campaignId}`,ctaLabel:input.ctaLabel||'Open your campaign',reference:campaign.reference_code});
}

export async function notifyAdmins(input:{campaignId?:string|null;type:string;title:string;message:string;sendEmailNotifications?:boolean;link?:string}){
  const db=createServiceClient();
  const link=input.link||(input.campaignId?`/admin/campaigns/${input.campaignId}`:'/admin');
  const {data:staff}=await db.from('profiles').select('id,email').in('role',['reviewer','admin','super_admin']);
  for(const person of staff??[]){
    await createNotification({userId:person.id,campaignId:input.campaignId,type:input.type,title:input.title,message:input.message,email:input.sendEmailNotifications===false?null:person.email,link,ctaLabel:'Review in admin portal'});
  }
  if(input.sendEmailNotifications===false) return;
  const compliance=process.env.GOODCAUSE_COMPLIANCE_EMAIL?.trim();
  if(compliance && !(staff??[]).some((p:any)=>p.email===compliance)){
    await sendEmail({to:compliance,subject:input.title,html:workflowEmailHtml({heading:input.title,message:input.message,ctaLabel:'Review in admin portal',ctaUrl:absolute(link)})}).catch(error=>console.error('compliance_email_failed',String(error)));
  }
}
