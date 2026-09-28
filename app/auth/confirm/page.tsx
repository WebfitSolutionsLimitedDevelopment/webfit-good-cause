import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { safeNext } from '@/lib/auth-email';
import { PRIVATE_META } from '@/lib/seo';

export const metadata = { ...PRIVATE_META, title: 'Confirm' };
export const dynamic = 'force-dynamic';

const TYPES = ['signup', 'recovery', 'magiclink', 'email'] as const;
type OtpType = (typeof TYPES)[number];

// The link opens this page and the person presses a button. Verifying on a button press
// (not on page load) stops email link scanners from using up the one-time link.
export default async function ConfirmPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const tokenHash = sp.token_hash || '';
  const type = (TYPES as readonly string[]).includes(sp.type || '') ? (sp.type as OtpType) : 'signup';
  const next = safeNext(sp.next, type === 'recovery' ? '/reset-password' : '/dashboard');
  const failed = sp.error === '1';

  async function verify(formData: FormData) {
    'use server';
    const token_hash = String(formData.get('token_hash') || '');
    const t = String(formData.get('type') || 'signup') as OtpType;
    const n = safeNext(formData.get('next'));
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: t });
    if (error) {
      console.error('verify_otp_failed', error.message);
      redirect(`/auth/confirm?error=1&type=${encodeURIComponent(t)}`);
    }
    redirect(n);
  }

  const label = type === 'recovery' ? 'Continue to reset password' : type === 'magiclink' ? 'Sign in' : 'Confirm my email';
  return <section className="auth-page"><div className="auth-card card">
    {failed || !tokenHash ? <>
      <h1>This link has expired</h1>
      <p className="muted">Links can only be used once and expire after a while. Please request a new one.</p>
      <p>{type === 'recovery' ? <Link className="button" href="/forgot-password">Send a new reset link</Link> : <Link className="button" href="/signup">Send a new confirmation link</Link>}</p>
      <p>Already confirmed? <Link className="text-link" href="/login">Log in</Link></p>
    </> : <>
      <h1>{type === 'recovery' ? 'Reset your password' : type === 'magiclink' ? 'Sign in to Good Cause' : 'Confirm your email'}</h1>
      <p className="muted">Press the button below to continue.</p>
      <form action={verify}>
        <input type="hidden" name="token_hash" value={tokenHash} />
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="next" value={next} />
        <button className="button">{label}</button>
      </form>
    </>}
  </div></section>;
}
