import Link from 'next/link';
import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase-server';
import { cancelSubscription } from '@/lib/recurring';
import { PRIVATE_META } from '@/lib/seo';

export const metadata = { ...PRIVATE_META, title: 'Manage your monthly gift' };
export const dynamic = 'force-dynamic';
const nzd = (c: number) => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(c / 100);

export default async function Manage({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const sp = await searchParams;
  const token = (sp.token || '').slice(0, 100);
  const db = createServiceClient();
  const { data: rec } = token ? await db.from('recurring_donations').select('id,status,amount_cents,card_fee_cents,created_at,campaigns(title,slug)').eq('manage_token', token).maybeSingle() : { data: null };

  async function stop(formData: FormData) {
    'use server';
    const t = String(formData.get('token') || '');
    const db = createServiceClient();
    const { data: r } = await db.from('recurring_donations').select('id').eq('manage_token', t).maybeSingle();
    if (r && process.env.STRIPE_SECRET_KEY) await cancelSubscription(new Stripe(process.env.STRIPE_SECRET_KEY), r.id, 'Cancelled by donor');
    redirect(`/giving/manage?token=${encodeURIComponent(t)}&done=1`);
  }

  const c = (rec as any)?.campaigns as { title: string; slug: string } | null;
  return <section className="auth-page"><div className="auth-card card">
    {!rec ? <><h1>Link not recognised</h1><p className="muted">Use the link in your monthly gift email, or contact Good Cause for help.</p><p><Link className="button" href="/contact">Contact us</Link></p></>
      : rec.status === 'cancelled' ? <><h1>Your monthly gift has stopped</h1><p className="muted">{sp.done ? 'Done. ' : ''}You will not be charged again for {c?.title || 'this campaign'}. Thank you for your support.</p>{c && <p><Link className="button" href={`/campaigns/${c.slug}`}>Back to the campaign</Link></p>}</>
      : <><h1>Your monthly gift</h1>
        <p><strong>{nzd(Number(rec.amount_cents))}</strong> a month to <strong>{c?.title}</strong> (you pay {nzd(Number(rec.amount_cents) + Number(rec.card_fee_cents))} including the card fee).</p>
        <p className="muted">Started {new Date(rec.created_at).toLocaleDateString('en-NZ')}{rec.status === 'past_due' ? ' · The last payment did not go through. Stripe will retry automatically.' : ''}</p>
        <form action={stop}><input type="hidden" name="token" value={token} /><button className="button">Stop my monthly gift</button></form>
        <p className="fineprint">Stopping takes effect straight away. Past gifts are not refunded automatically; contact us if you need help.</p></>}
  </div></section>;
}
