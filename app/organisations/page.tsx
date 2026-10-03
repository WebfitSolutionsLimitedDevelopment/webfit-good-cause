import Link from 'next/link';
import { listApprovedOrgs, ORG_TYPES } from '@/lib/organisations';
import { absoluteUrl, breadcrumbJsonLd, pageMeta } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageMeta({ path: '/organisations', title: 'Charities, schools and groups fundraising in NZ', description: 'New Zealand charities, schools, clubs, marae and community groups raising money on Good Cause. See their live appeals and donate securely.', keywords: ['charities NZ', 'school fundraising NZ', 'community groups NZ', 'donate to a charity NZ'] });

export default async function Organisations() {
  const orgs = await listApprovedOrgs();
  const listLd = { '@context': 'https://schema.org', '@type': 'ItemList', name: 'Organisations fundraising on Good Cause', itemListElement: orgs.map((o, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/organisations/${o.slug}`), name: o.name })) };
  return <>
    <JsonLd data={listLd} />
    <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Organisations', path: '/organisations' }])} />
    <section className="page-hero"><div className="shell">
      <div className="eyebrow">Organisations</div>
      <h1>Charities, schools and groups on Good Cause</h1>
      <p className="muted">Every organisation page is checked by the Good Cause team before it is published.</p>
    </div></section>
    <section className="section"><div className="shell">
      {orgs.length ? <div className="grid-3">{orgs.map((o) => <Link className="card guide-card" key={o.id} href={`/organisations/${o.slug}`}>
        <span className="eyebrow">{ORG_TYPES[o.org_type] || 'Organisation'}{o.location ? ` · ${o.location}` : ''}</span>
        <h2>{o.name}</h2>
        <p className="muted">{o.about.slice(0, 160)}{o.about.length > 160 ? '…' : ''}</p>
      </Link>)}</div>
        : <div className="card empty-state"><h2>No organisation pages yet</h2><p>Run a school, club, charity or community group? <Link href="/dashboard/organisation">Create your organisation page</Link>.</p></div>}
      <p className="muted" style={{ marginTop: 28 }}>Represent a group? <Link href="/dashboard/organisation">Create or update your organisation page</Link>.</p>
    </div></section>
  </>;
}
