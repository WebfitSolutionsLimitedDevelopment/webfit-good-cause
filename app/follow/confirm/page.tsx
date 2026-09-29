import Link from 'next/link';
import { confirmFollow } from '@/lib/followers';
import { PRIVATE_META } from '@/lib/seo';

export const metadata = { ...PRIVATE_META, title: 'Confirm updates' };
export const dynamic = 'force-dynamic';

// Confirm on a button press, so email link scanners cannot subscribe people.
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string; done?: string; slug?: string; title?: string }> }) {
  const sp = await searchParams;
  async function confirm(formData: FormData) {
    'use server';
    const { redirect } = await import('next/navigation');
    const res = await confirmFollow(String(formData.get('token') || ''));
    redirect(res?.campaigns ? `/follow/confirm?done=1&slug=${encodeURIComponent(res.campaigns.slug)}&title=${encodeURIComponent(res.campaigns.title)}` : '/follow/confirm?done=0');
  }
  return <section className="auth-page"><div className="auth-card card">
    {sp.done === '1' ? <><h1>You are following this campaign</h1><p className="muted">We will email you when {sp.title || 'the campaign'} posts an update.</p>{sp.slug && <p><Link className="button" href={`/campaigns/${sp.slug}`}>Back to the campaign</Link></p>}</>
      : sp.done === '0' || !sp.token ? <><h1>This link is not valid</h1><p className="muted">It may have been used already. You can follow again from the campaign page.</p><p><Link className="button" href="/campaigns">See fundraisers</Link></p></>
      : <><h1>Confirm email updates</h1><p className="muted">Press the button to start getting updates about this campaign.</p><form action={confirm}><input type="hidden" name="token" value={sp.token} /><button className="button">Yes, send me updates</button></form></>}
  </div></section>;
}
