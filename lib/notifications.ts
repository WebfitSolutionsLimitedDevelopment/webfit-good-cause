import { createServiceClient } from './supabase-server';
import { sendEmail } from './email';

export async function createNotification(input:{userId?:string|null;campaignId?:string|null;type:string;title:string;message:string;email?:string|null}){
  const db=createServiceClient();
  if(input.userId){
    await db.from('notifications').insert({user_id:input.userId,campaign_id:input.campaignId||null,type:input.type,title:input.title,message:input.message});
  }
  if(input.email){
    await sendEmail({to:input.email,subject:input.title,html:`<p>${input.message}</p><p>Sign in to Good Cause for full details.</p>`}).catch(()=>null);
  }
}

export async function notifyAdmins(input:{campaignId?:string|null;type:string;title:string;message:string;sendEmailNotifications?:boolean}){
  const db=createServiceClient();
  const {data:staff}=await db.from('profiles').select('id,email').in('role',['admin','super_admin']);
  for(const person of staff??[]){
    await createNotification({userId:person.id,campaignId:input.campaignId,type:input.type,title:input.title,message:input.message,email:input.sendEmailNotifications===false?null:person.email});
  }
  if(input.sendEmailNotifications===false) return;
  const compliance=process.env.GOODCAUSE_COMPLIANCE_EMAIL;
  if(compliance && !(staff??[]).some((p:any)=>p.email===compliance)){
    await sendEmail({to:compliance,subject:input.title,html:`<p>${input.message}</p>`}).catch(()=>null);
  }
}
