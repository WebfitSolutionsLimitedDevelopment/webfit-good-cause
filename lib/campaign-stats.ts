import { createServiceClient } from './supabase-server';

export async function getCampaignStats(campaignId:string){
  if(!campaignId) return {raised:0,donors:0};
  const db=createServiceClient();
  if(!db) return {raised:0,donors:0};
  const {data,error}=await db.from('donations').select('amount_cents').eq('campaign_id',campaignId).eq('status','succeeded');
  if(error||!data) return {raised:0,donors:0};
  return {raised:data.reduce((sum,row)=>sum+Number(row.amount_cents||0),0)/100,donors:data.length};
}
