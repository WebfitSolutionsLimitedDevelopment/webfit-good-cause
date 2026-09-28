import Link from 'next/link';
import { getGuide } from '@/lib/guides';

export function RelatedGuides({ slugs, heading = 'Helpful guides' }: { slugs: string[]; heading?: string }) {
  const guides = slugs.map(getGuide).filter(Boolean) as NonNullable<ReturnType<typeof getGuide>>[];
  if (!guides.length) return null;
  return <aside className="related-guides"><h2>{heading}</h2><ul>{guides.map((g) => <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.title}</Link></li>)}</ul><p><Link href="/guides">See all fundraising guides</Link></p></aside>;
}
