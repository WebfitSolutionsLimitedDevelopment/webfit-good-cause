import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { confirmUrl, sendAuthEmail } from '@/lib/auth-email';

export const runtime = 'nodejs';
const SENT = 'If there is a Good Cause account for that email, we have sent a password reset link.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 180);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  const admin = createServiceClient();
  const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email });
  if (!error && data?.properties?.hashed_token) {
    await sendAuthEmail(email, 'recovery', confirmUrl(data.properties.hashed_token, 'recovery', '/reset-password'))
      .catch((e) => console.error('reset_email_failed', String(e)));
  } else if (error && !/not found|no user/i.test(error.message)) {
    console.error('reset_generate_link_failed', error.message);
  }
  // Same response either way so the form does not reveal which emails have accounts.
  return NextResponse.json({ ok: true, message: SENT });
}
