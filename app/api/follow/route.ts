import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { requestFollow } from '@/lib/followers';

export const runtime = 'nodejs';
const DONE = 'Check your email to confirm. We only send updates you ask for, and you can unsubscribe at any time.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true, message: DONE });
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 180);
  const slug = String(body.campaignSlug ?? '').trim().slice(0, 100);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  const db = createServiceClient();
  const { data: campaign } = await db.from('campaigns').select('id,title').eq('slug', slug).eq('status', 'live').maybeSingle();
  if (!campaign) return NextResponse.json({ error: 'This campaign is not available.' }, { status: 404 });
  try {
    await requestFollow(campaign.id, campaign.title, email);
  } catch {
    return NextResponse.json({ error: 'We could not sign you up right now. Please try again.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: DONE });
}
