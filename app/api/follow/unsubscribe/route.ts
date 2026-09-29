import { NextResponse } from 'next/server';
import { unsubscribeFollow } from '@/lib/followers';

// One-click unsubscribe (RFC 8058) used by email clients via List-Unsubscribe-Post.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (token) await unsubscribeFollow(token);
  return NextResponse.json({ ok: true });
}
