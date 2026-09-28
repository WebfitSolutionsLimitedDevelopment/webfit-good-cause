import Link from 'next/link';
import { GUIDES } from '@/lib/guides';
import { breadcrumbJsonLd, pageMeta, absoluteUrl } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';

export const metadata = pageMeta({
  path: '/guides',
  title: 'Fundraising guides for New Zealand',
  description: 'Free, plain-English guides to fundraising in New Zealand: how to start a fundraiser, ideas, Auckland rules, fees, tax credits and writing your page.',
  keywords: ['fundraising guide NZ', 'how to fundraise', 'fundraising tips New Zealand', 'fundraising help'],
});

export default function GuidesPage() {
  const listLd = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Fundraising guides for New Zealand',
    itemListElement: GUIDES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/guides/${g.slug}`), name: g.title })),
  };
  return <>
    <JsonLd data={listLd} />
    <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Guides', path: '/guides' }])} />
    <section className="page-hero"><div className="shell"><div className="eyebrow">Fundraising guides</div><h1>Fundraising in New Zealand, explained</h1><p className="muted">Practical guides for anyone raising money for a person, family, school, club or community in Aotearoa.</p></div></section>
    <section className="section"><div className="shell"><div className="grid-3">
      {GUIDES.map((g) => <article className="card guide-card" key={g.slug}>
        <h2><Link href={`/guides/${g.slug}`}>{g.title}</Link></h2>
        <p className="muted">{g.description}</p>
        <Link className="button small secondary" href={`/guides/${g.slug}`}>Read the guide</Link>
      </article>)}
    </div>
    <div className="card guide-cta"><h2>Ready to start?</h2><p>It is free to start a fundraiser. Every campaign is reviewed, and the cause receives 97.5% of each donation.</p><Link className="button" href="/start">Start a fundraiser</Link></div>
    </div></section>
  </>;
}
