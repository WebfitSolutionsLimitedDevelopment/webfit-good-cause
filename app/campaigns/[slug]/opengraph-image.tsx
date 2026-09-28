import { brandedOg, OG_SIZE } from '@/lib/og';
import { getPublicCampaign } from '@/lib/public-campaigns';
import { money } from '@/lib/fees';

export const alt = 'Good Cause fundraiser';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getPublicCampaign(slug).catch(() => null);
  if (!c) return brandedOg({ eyebrow: 'Fundraiser', title: 'Support a verified cause in New Zealand' });
  const footer = c.goal > 0 ? `${money(c.raised)} raised of ${money(c.goal)} · ${c.donors} supporters` : `${money(c.raised)} raised · ${c.donors} supporters`;
  return brandedOg({ eyebrow: c.category || 'Fundraiser', title: c.title, footer });
}
