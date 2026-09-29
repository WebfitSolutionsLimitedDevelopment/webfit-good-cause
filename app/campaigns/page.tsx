import Link from 'next/link';
import type { Metadata } from 'next';
import { CampaignCard } from '@/components/CampaignCard';
import { getPublicCampaigns } from '@/lib/public-campaigns';
import { absoluteUrl, pageMeta } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

type SP = { q?: string; category?: string; sort?: string };

const BASE = { path: '/campaigns', title: 'Donate to causes in New Zealand', description: 'Browse live, verified fundraisers in New Zealand and donate securely online. See who receives the money and how much has been raised.', keywords: ['donate NZ', 'fundraisers near me', 'NZ appeals', 'charity appeal NZ', 'find a fundraiser'] };

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Boolean(sp.q || sp.category || sp.sort);
  const meta = pageMeta(BASE);
  // Filtered views keep the canonical /campaigns and are not indexed separately.
  return filtered ? { ...meta, robots: { index: false, follow: true } } : meta;
}

const SORTS: Record<string, string> = { newest: 'Newest', raised: 'Most raised', close: 'Closest to target' };

export default async function Campaigns({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const all = await getPublicCampaigns();
  const q = (sp.q || '').trim().toLowerCase().slice(0, 80);
  const category = sp.category || '';
  const sort = SORTS[sp.sort || ''] ? sp.sort! : 'newest';
  const categories = [...new Set(all.map((c) => c.category).filter(Boolean))].sort();

  let campaigns = all.filter((c) => (!category || c.category === category) && (!q || `${c.title} ${c.summary} ${c.location} ${c.category}`.toLowerCase().includes(q)));
  if (sort === 'raised') campaigns = [...campaigns].sort((a, b) => b.raised - a.raised);
  if (sort === 'close') campaigns = [...campaigns].sort((a, b) => (b.goal ? b.raised / b.goal : 0) - (a.goal ? a.raised / a.goal : 0));

  const listLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Live fundraisers in New Zealand', itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/campaigns/${c.slug}`), name: c.title })) };
  const href = (next: Partial<SP>) => { const p = new URLSearchParams(); const m = { q: sp.q, category, sort: sp.sort, ...next }; Object.entries(m).forEach(([k, v]) => v && p.set(k, v)); const s = p.toString(); return s ? `/campaigns?${s}` : '/campaigns'; };

  return <>
    <JsonLd data={listLd} />
    <section className="page-hero"><div className="shell">
      <div className="eyebrow">Explore Good Cause</div>
      <h1>Find a cause to support</h1>
      <p className="muted">Every published campaign completes Good Cause review before accepting donations. Donate securely to verified New Zealand fundraisers, and the cause receives 97.5% of your donation.</p>
      <form className="explore-search" action="/campaigns" role="search">
        <label className="sr-only" htmlFor="q">Search fundraisers</label>
        <input id="q" name="q" type="search" defaultValue={sp.q || ''} placeholder="Search by name, place or cause" />
        {category && <input type="hidden" name="category" value={category} />}
        <select name="sort" defaultValue={sort} aria-label="Sort fundraisers">{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button className="button small">Search</button>
      </form>
      {categories.length > 1 && <nav className="explore-chips" aria-label="Filter by category">
        <Link className={!category ? 'chip active' : 'chip'} href={href({ category: '' })}>All</Link>
        {categories.map((cat) => <Link key={cat} className={category === cat ? 'chip active' : 'chip'} href={href({ category: cat })}>{cat}</Link>)}
      </nav>}
    </div></section>
    <section className="section"><div className="shell">
      {(q || category) && <p className="muted">{campaigns.length} {campaigns.length === 1 ? 'fundraiser' : 'fundraisers'} found. <Link href="/campaigns">Clear filters</Link></p>}
      {campaigns.length ? <div className="grid-3">{campaigns.map((c) => <CampaignCard key={c.slug} campaign={c} />)}</div>
        : <div className="card empty-state"><h2>{all.length ? 'No fundraisers match your search' : 'No live campaigns right now'}</h2><p>{all.length ? <Link href="/campaigns">See all live fundraisers</Link> : 'Approved campaigns will appear here as soon as they go live.'}</p></div>}
      <p className="muted" style={{ marginTop: 28 }}>Want to raise money yourself? <Link href="/start">Start a fundraiser</Link> or read <Link href="/guides/how-to-fundraise-online-nz">how to fundraise online in NZ</Link>.</p>
    </div></section>
  </>;
}
