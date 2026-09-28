import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GUIDES, getGuide } from '@/lib/guides';
import { absoluteUrl, breadcrumbJsonLd, pageMeta } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) return {};
  return pageMeta({ path: `/guides/${g.slug}`, title: g.metaTitle, description: g.description, keywords: g.keywords, type: 'article' });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = getGuide(slug);
  if (!g) notFound();
  const url = absoluteUrl(`/guides/${g.slug}`);
  const updated = new Intl.DateTimeFormat('en-NZ', { dateStyle: 'long', timeZone: 'Pacific/Auckland' }).format(new Date(g.updated));
  const articleLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, url,
    mainEntityOfPage: url, inLanguage: 'en-NZ', datePublished: g.updated, dateModified: g.updated, keywords: g.keywords.join(', '),
    author: { '@type': 'Organization', name: 'Good Cause', url: absoluteUrl('/about') },
    isAccessibleForFree: true,
    publisher: { '@id': absoluteUrl('/#organization') },
  };
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: g.faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  const related = g.related.map(getGuide).filter(Boolean) as NonNullable<ReturnType<typeof getGuide>>[];

  return <>
    <JsonLd data={articleLd} />
    <JsonLd data={faqLd} />
    <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }, { name: g.title, path: `/guides/${g.slug}` }])} />
    <section className="page-hero"><div className="shell">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link> / <Link href="/guides">Guides</Link></nav>
      <div className="eyebrow">Fundraising guide</div>
      <h1>{g.title}</h1>
      <p className="muted">{g.intro}</p>
      <p className="fineprint">Written and reviewed by the Good Cause team at Webfit Solutions Limited · Updated {updated} · <Link href="/about">About Good Cause</Link></p>
    </div></section>
    <section className="section"><div className="shell prose">
      {g.sections.map((s) => <section key={s.heading}>
        <h2>{s.heading}</h2>
        {s.body.map((p, i) => <p key={i}>{p}</p>)}
        {s.list && <ul>{s.list.map((item) => <li key={item}>{item}</li>)}</ul>}
      </section>)}

      <div className="card guide-cta"><h2>Start your fundraiser</h2><p>Free to start. Reviewed by a person. The cause receives 97.5% of every donation.</p><p><Link className="button" href="/start">Start a fundraiser</Link> <Link className="button secondary" href="/campaigns">See live fundraisers</Link></p></div>

      <h2>Common questions</h2>
      <div className="faq-list">{g.faqs.map((f) => <article className="faq-item" key={f.q}><h3>{f.q}</h3><p>{f.a}</p></article>)}</div>

      {related.length > 0 && <><h2>Related guides</h2><ul>{related.map((r) => <li key={r.slug}><Link href={`/guides/${r.slug}`}>{r.title}</Link></li>)}</ul></>}

      {g.sources && g.sources.length > 0 && <><h2>Sources</h2><ul>{g.sources.map((s) => <li key={s.url}><a href={s.url} rel="noopener nofollow" target="_blank">{s.label}</a></li>)}</ul></>}
      <p className="fineprint">This guide is general information, not legal, tax or financial advice.</p>
    </div></section>
  </>;
}
