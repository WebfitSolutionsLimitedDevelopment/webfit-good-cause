import { GUIDES } from '@/lib/guides';
import { SITE_URL } from '@/lib/seo';
import { createServiceClient } from '@/lib/supabase-server';

export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const items: { title: string; link: string; description: string; date: Date }[] = GUIDES.map((g) => ({ title: g.title, link: `${SITE_URL}/guides/${g.slug}`, description: g.description, date: new Date(g.updated) }));
  try {
    const db = createServiceClient();
    const { data } = await db.from('campaigns').select('slug,title,summary,published_at,created_at').eq('status', 'live');
    for (const c of data ?? []) items.push({ title: `Fundraiser: ${c.title}`, link: `${SITE_URL}/campaigns/${c.slug}`, description: c.summary || '', date: new Date(c.published_at || c.created_at) });
  } catch (error) {
    console.error('feed_campaigns_failed', error);
  }
  items.sort((a, b) => b.date.getTime() - a.date.getTime());
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Good Cause – fundraisers and guides</title>
<link>${SITE_URL}</link>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
<description>New fundraisers and fundraising guides from Good Cause, New Zealand.</description>
<language>en-nz</language>
${items.map((i) => `<item><title>${esc(i.title)}</title><link>${i.link}</link><guid isPermaLink="true">${i.link}</guid><pubDate>${i.date.toUTCString()}</pubDate><description>${esc(i.description)}</description></item>`).join('\n')}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
