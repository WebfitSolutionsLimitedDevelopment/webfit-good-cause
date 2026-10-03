import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CampaignCard } from '@/components/CampaignCard';
import { getApprovedOrg, ORG_TYPES } from '@/lib/organisations';
import { money } from '@/lib/fees';
import { absoluteUrl, breadcrumbJsonLd, pageMeta } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const r = await getApprovedOrg(slug).catch(() => null);
  if (!r) return pageMeta({ path: `/organisations/${slug}`, title: 'Organisation not found', description: 'This organisation page is not available.', noindex: true });
  const { org } = r;
  return pageMeta({ path: `/organisations/${org.slug}`, title: `${org.name} – fundraising and appeals`, description: `${org.about.replace(/\s+/g, ' ').slice(0, 120)} Donate to ${org.name} on Good Cause.`.trim(), keywords: [org.name, `${org.name} donate`, `${org.name} fundraiser`, org.location || ''].filter(Boolean) });
}

export default async function OrgPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await getApprovedOrg(slug);
  if (!r) notFound();
  const { org, campaigns, authorityVerified } = r;
  const raised = campaigns.reduce((a, c) => a + c.raised, 0);
  const supporters = campaigns.reduce((a, c) => a + c.donors, 0);
  const url = absoluteUrl(`/organisations/${org.slug}`);
  const orgLd = {
    '@context': 'https://schema.org', '@type': org.org_type === 'charity' ? 'NGO' : org.org_type === 'school' ? 'EducationalOrganization' : 'Organization',
    '@id': `${url}#org`, name: org.name, url, description: org.about, ...(org.website ? { sameAs: [org.website] } : {}),
    ...(org.location ? { address: { '@type': 'PostalAddress', addressLocality: org.location, addressCountry: 'NZ' } } : {}),
  };
  return <>
    <JsonLd data={orgLd} />
    <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Organisations', path: '/organisations' }, { name: org.name, path: `/organisations/${org.slug}` }])} />
    <section className="page-hero"><div className="shell">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/organisations">Organisations</Link></nav>
      <div className="eyebrow">{ORG_TYPES[org.org_type] || 'Organisation'}{org.location ? ` · ${org.location}` : ''}</div>
      <h1>{org.name}</h1>
      <p className="muted">{authorityVerified ? 'Page checked by Good Cause. Authority to fundraise verified.' : 'Page checked by Good Cause.'}{org.charity_number ? ` Charities Services registration: ${org.charity_number}.` : ''}</p>
    </div></section>
    <section className="section"><div className="shell">
      <div className="org-stats"><div><strong>{campaigns.length}</strong><span>live {campaigns.length === 1 ? 'appeal' : 'appeals'}</span></div><div><strong>{money(raised)}</strong><span>raised</span></div><div><strong>{supporters}</strong><span>supporters</span></div></div>
      <div className="prose"><h2>About {org.name}</h2>{org.about.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}{org.website && <p><a href={org.website} target="_blank" rel="noopener nofollow">Visit their website</a></p>}</div>
      <h2 style={{ marginTop: 40 }}>Live appeals</h2>
      {campaigns.length ? <div className="grid-3">{campaigns.map((c) => <CampaignCard key={c.slug} campaign={c} />)}</div> : <p className="muted">No live appeals right now.</p>}
    </div></section>
  </>;
}
