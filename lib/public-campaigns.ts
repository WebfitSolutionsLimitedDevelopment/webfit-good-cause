import { unstable_noStore as noStore } from 'next/cache';
import { createServiceClient } from './supabase-server';

export type PublicCampaign = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  story: string;
  category: string;
  location: string;
  raised: number;
  goal: number;
  donors: number;
  beneficiary: string;
  beneficiaryVerified: boolean;
  lastContributor: string | null;
  coverMediaId: string | null;
};

export async function getPublicCampaigns(): Promise<PublicCampaign[]> {
  noStore();
  const s = createServiceClient();
  const { data: rowsData } = await s
    .from('campaigns')
    .select('id,slug,title,summary,story,category,location,target_cents,beneficiaries(display_name,identity_status,consent_status)')
    .eq('status', 'live')
    .order('published_at', { ascending: false });

  const rows = rowsData ?? [];
  if (!rows.length) return [];

  const ids = (rows as any[]).map((c:any)=>c.id);
  const [{data:donationRows},{data:mediaRows}] = await Promise.all([
    s.from('donations')
      .select('campaign_id,amount_cents,donor_display_name,anonymous,created_at')
      .in('campaign_id',ids)
      .eq('status','succeeded')
      .order('created_at',{ascending:false}),
    s.from('campaign_media')
      .select('id,campaign_id,is_primary,created_at')
      .in('campaign_id',ids)
      .eq('kind','image')
      .eq('status','approved')
      .order('created_at',{ascending:false})
  ]);

  const donationsByCampaign = new Map<string,any[]>();
  for (const d of donationRows ?? []) {
    const list=donationsByCampaign.get((d as any).campaign_id)??[];
    list.push(d); donationsByCampaign.set((d as any).campaign_id,list);
  }
  const mediaByCampaign = new Map<string,any[]>();
  for (const m of mediaRows ?? []) {
    const list=mediaByCampaign.get((m as any).campaign_id)??[];
    list.push(m); mediaByCampaign.set((m as any).campaign_id,list);
  }

  return (rows as any[]).map((c:any)=>{
    const d=donationsByCampaign.get(c.id)??[];
    const latest=d[0];
    const media=mediaByCampaign.get(c.id)??[];
    const cover=media.find((m:any)=>m.is_primary) ?? media[0] ?? null;
    const beneficiaryVerified=c.beneficiaries?.identity_status==='verified'&&c.beneficiaries?.consent_status==='verified';
    return {
      id:c.id, slug:c.slug, title:c.title, summary:c.summary, story:c.story,
      category:c.category, location:c.location||'',
      raised:d.reduce((a:number,x:any)=>a+Number(x.amount_cents||0),0)/100,
      goal:Number(c.target_cents||0)/100,
      donors:d.length,
      beneficiary:beneficiaryVerified?(c.beneficiaries?.display_name||'Verified beneficiary'):'',
      beneficiaryVerified,
      lastContributor:latest?(latest.anonymous?'Anonymous supporter':latest.donor_display_name||'Supporter'):null,
      coverMediaId:cover?.id||null
    };
  });
}

export async function getPublicCampaign(slug:string){
  const all=await getPublicCampaigns();
  return all.find(x=>x.slug===slug)||null;
}
