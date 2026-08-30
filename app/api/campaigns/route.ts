import { NextResponse } from 'next/server';
import { getPublicCampaigns } from '@/lib/public-campaigns';
export async function GET(){return NextResponse.json({campaigns:await getPublicCampaigns()});}
