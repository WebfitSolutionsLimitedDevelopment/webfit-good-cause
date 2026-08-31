import { NextResponse } from 'next/server';
import { createServerSupabaseClient,createServiceClient } from '@/lib/supabase-server';
import { notifyAdmins } from '@/lib/notifications';

const imageTypes=new Set(['image/jpeg','image/png','image/webp']);
export async function POST(request:Request){
  const auth=await createServerSupabaseClient();const {data:{user}}=await auth.auth.getUser();
  if(!user)return NextResponse.json({error:'Unauthorised'},{status:401});
  const form=await request.formData();const campaignId=String(form.get('campaignId')||'');const kind=String(form.get('kind')||'');const title=String(form.get('title')||'').trim();const url=String(form.get('url')||'').trim();const file=form.get('file');const isPrimary=String(form.get('isPrimary')||'')==='true';
  if(!campaignId||!title||!['image','video','article'].includes(kind))return NextResponse.json({error:'Complete the required media fields.'},{status:400});
  const service=createServiceClient();
  const [{data:campaign},{data:profile}]=await Promise.all([
    service.from('campaigns').select('id,owner_id,title,reference_code').eq('id',campaignId).maybeSingle(),
    service.from('profiles').select('role').eq('id',user.id).maybeSingle()
  ]);
  const isSuperAdmin=profile?.role==='super_admin';
  if(!campaign||(campaign.owner_id!==user.id&&!isSuperAdmin))return NextResponse.json({error:'Forbidden'},{status:403});
  let storagePath:string|null=null,fileName:string|null=null,mimeType:string|null=null;
  if(kind==='image'){
    if(!(file instanceof File))return NextResponse.json({error:'Choose an image file.'},{status:400});
    if(file.size>10*1024*1024||!imageTypes.has(file.type))return NextResponse.json({error:'Use JPG, PNG or WEBP images up to 10MB.'},{status:400});
    const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');storagePath=`${user.id}/${campaignId}/${crypto.randomUUID()}-${safe}`;fileName=file.name;mimeType=file.type;
    const bytes=new Uint8Array(await file.arrayBuffer());const {error}=await service.storage.from(process.env.SUPABASE_CAMPAIGN_MEDIA_BUCKET||'campaign-media').upload(storagePath,bytes,{contentType:file.type,upsert:false});if(error)return NextResponse.json({error:error.message},{status:400});
  }else{
    try{const parsed=new URL(url);if(!['http:','https:'].includes(parsed.protocol))throw new Error();}catch{return NextResponse.json({error:'Enter a valid https URL.'},{status:400});}
  }
  if(isSuperAdmin&&kind==='image'&&isPrimary){
    await service.from('campaign_media').update({is_primary:false}).eq('campaign_id',campaignId).eq('kind','image');
  }
  const status=isSuperAdmin?'approved':'pending';
  const {data:item,error}=await service.from('campaign_media').insert({campaign_id:campaignId,owner_user_id:user.id,kind,title,url:url||null,storage_path:storagePath,file_name:fileName,mime_type:mimeType,is_primary:kind==='image'&&isPrimary,status}).select('id').single();
  if(error)return NextResponse.json({error:error.message},{status:400});
  await service.from('audit_events').insert({actor_user_id:user.id,campaign_id:campaignId,event_type:isSuperAdmin?'campaign_media_published':'campaign_media_submitted',entity_type:'campaign_media',entity_id:item.id,metadata:{kind,title,is_primary:isPrimary,direct_publish:isSuperAdmin}});
  if(!isSuperAdmin){
    await notifyAdmins({campaignId,type:'campaign_media_submitted',title:`Campaign media awaiting approval: ${campaign.reference_code}`,message:`${campaign.title} has a new ${kind} submission. It is not public until approved.`});
  }
  return NextResponse.json({ok:true,message:isSuperAdmin?'Media published successfully.':'Media submitted for admin approval.'});
}

export async function PATCH(request:Request){
  const auth=await createServerSupabaseClient();
  const {data:{user}}=await auth.auth.getUser();
  if(!user)return NextResponse.json({error:'Unauthorised'},{status:401});
  const body=await request.json().catch(()=>null) as any;
  const campaignId=String(body?.campaignId||'');
  const mediaId=String(body?.mediaId||'');
  if(!campaignId||!mediaId||body?.action!=='set_primary')return NextResponse.json({error:'Invalid request.'},{status:400});
  const service=createServiceClient();
  const [{data:profile},{data:campaign},{data:media}]=await Promise.all([
    service.from('profiles').select('role').eq('id',user.id).maybeSingle(),
    service.from('campaigns').select('id,owner_id').eq('id',campaignId).maybeSingle(),
    service.from('campaign_media').select('id,campaign_id,kind,status').eq('id',mediaId).maybeSingle()
  ]);
  const isSuperAdmin=profile?.role==='super_admin';
  if(!campaign||(campaign.owner_id!==user.id&&!isSuperAdmin))return NextResponse.json({error:'Forbidden'},{status:403});
  if(!media||media.campaign_id!==campaignId||media.kind!=='image'||media.status!=='approved')return NextResponse.json({error:'Choose an approved campaign image.'},{status:400});
  if(!isSuperAdmin)return NextResponse.json({error:'Only a super admin can change the main image on a live campaign.'},{status:403});
  await service.from('campaign_media').update({is_primary:false}).eq('campaign_id',campaignId).eq('kind','image');
  const {error}=await service.from('campaign_media').update({is_primary:true}).eq('id',mediaId);
  if(error)return NextResponse.json({error:error.message},{status:400});
  await service.from('audit_events').insert({actor_user_id:user.id,campaign_id:campaignId,event_type:'campaign_cover_changed',entity_type:'campaign_media',entity_id:mediaId,metadata:{direct_publish:true}});
  return NextResponse.json({ok:true,message:'Main campaign image updated.'});
}
