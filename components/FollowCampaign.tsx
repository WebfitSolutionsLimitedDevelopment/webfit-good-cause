'use client';
import { FormEvent, useState } from 'react';

export function FollowCampaign({ campaignSlug }: { campaignSlug: string }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = (e.currentTarget.elements.namedItem('website') as HTMLInputElement | null)?.value || '';
    setBusy(true); setMsg('');
    try {
      const res = await fetch('/api/follow', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ campaignSlug, email, website }) });
      const data = await res.json().catch(() => ({}));
      setMsg(res.ok ? data.message : data.error || 'Something went wrong. Please try again.');
      if (res.ok) setEmail('');
    } catch { setMsg('Something went wrong. Please try again.'); }
    setBusy(false);
  }
  return <form className="follow-campaign card" onSubmit={submit}>
    <h3>Follow this campaign</h3>
    <p className="muted">Get an email when the organiser posts an update. No spam, unsubscribe any time.</p>
    <div className="follow-row">
      <label className="sr-only" htmlFor={`follow-${campaignSlug}`}>Email address</label>
      <input id={`follow-${campaignSlug}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
      <button className="button small" disabled={busy}>{busy ? 'Sending…' : 'Follow'}</button>
    </div>
    {msg && <p className="fineprint" role="status">{msg}</p>}
  </form>;
}
