import Link from 'next/link';
import { unsubscribeFollow } from '@/lib/followers';
import { PRIVATE_META } from '@/lib/seo';

export const metadata = { ...PRIVATE_META, title: 'Unsubscribe' };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const sp = await searchParams;
  async function unsubscribe(formData: FormData) {
    'use server';
    const { redirect } = await import('next/navigation');
    await unsubscribeFollow(String(formData.get('token') || ''));
    redirect('/follow/unsubscribe?done=1');
  }
  return <section className="auth-page"><div className="auth-card card">
    {sp.done === '1' ? <><h1>You have been unsubscribed</h1><p className="muted">You will not get any more updates about this campaign.</p><p><Link className="button" href="/campaigns">See fundraisers</Link></p></>
      : !sp.token ? <><h1>This link is not valid</h1><p><Link className="button" href="/campaigns">See fundraisers</Link></p></>
      : <><h1>Stop campaign updates?</h1><form action={unsubscribe}><input type="hidden" name="token" value={sp.token} /><button className="button">Unsubscribe</button></form></>}
  </div></section>;
}
