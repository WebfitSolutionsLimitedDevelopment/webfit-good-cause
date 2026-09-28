import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { confirmUrl, safeNext, sendAuthEmail } from '@/lib/auth-email';

export const runtime = 'nodejs';

const clean = (v: unknown, max = 180) => String(v ?? '').trim().slice(0, max);
const SENT = 'Check your email for a link to confirm your account. It can take a minute to arrive.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.website) return NextResponse.json({ ok: true, message: SENT }); // honeypot
  const email = clean(body.email).toLowerCase();
  const password = String(body.password ?? '');
  const fullName = clean(body.fullName, 120);
  const mobile = clean(body.mobile, 40);
  const next = safeNext(body.next);

  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  if (password.length < 10) return NextResponse.json({ error: 'Please use a password of at least 10 characters.' }, { status: 400 });
  if (fullName.length < 2) return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
  if (mobile.length < 7) return NextResponse.json({ error: 'Please enter a valid mobile number.' }, { status: 400 });

  const admin = createServiceClient();
  let { data, error } = await admin.auth.admin.generateLink({ type: 'signup', email, password, options: { data: { full_name: fullName, mobile } } });
  let type: 'signup' | 'magiclink' = 'signup';

  if (error && /already|registered|exists/i.test(error.message)) {
    // Existing account: send a sign-in link to the owner instead of revealing that the email is registered.
    type = 'magiclink';
    ({ data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email }));
  }
  if (error || !data?.properties?.hashed_token) {
    console.error('signup_generate_link_failed', error?.message);
    return NextResponse.json({ error: 'We could not create your account right now. Please try again shortly.' }, { status: 500 });
  }

  try {
    await sendAuthEmail(email, type, confirmUrl(data.properties.hashed_token, type, next));
  } catch (e) {
    console.error('signup_email_failed', String(e));
    return NextResponse.json({ error: 'Your account was created but we could not send the confirmation email. Please try again in a minute.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: SENT });
}
