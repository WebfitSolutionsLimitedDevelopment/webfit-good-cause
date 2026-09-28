import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';
import { GUIDES } from '@/lib/guides';
import { createServiceClient } from '@/lib/supabase-server';

export const revalidate = 3600;

const STATIC: [string, number, MetadataRoute.Sitemap[number]['changeFrequency']][] = [
  ['', 1, 'daily'], ['/campaigns', 0.9, 'daily'], ['/start', 0.9, 'monthly'], ['/how-it-works', 0.8, 'monthly'],
  ['/fees', 0.8, 'monthly'], ['/guides', 0.8, 'weekly'], ['/faq', 0.7, 'monthly'], ['/verification', 0.6, 'monthly'],
  ['/safety', 0.6, 'monthly'], ['/transparency', 0.6, 'monthly'], ['/about', 0.5, 'monthly'], ['/contact', 0.5, 'yearly'],
  ['/report', 0.4, 'yearly'], ['/complaints', 0.3, 'yearly'], ['/refunds', 0.3, 'yearly'], ['/terms', 0.3, 'yearly'],
  ['/privacy', 0.3, 'yearly'], ['/acceptable-use', 0.3, 'yearly'], ['/fundraising-policy', 0.3, 'yearly'],
  ['/beneficiary-policy', 0.3, 'yearly'], ['/payment-policy', 0.3, 'yearly'], ['/aml-risk', 0.2, 'yearly'],
  ['/conflicts', 0.2, 'yearly'], ['/editorial-independence', 0.2, 'yearly'],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC.map(([path, priority, changeFrequency]) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority }));
  for (const g of GUIDES) entries.push({ url: `${SITE_URL}/guides/${g.slug}`, lastModified: new Date(g.updated), changeFrequency: 'monthly', priority: 0.7 });
  try {
    const db = createServiceClient();
    const { data } = await db.from('campaigns').select('slug,updated_at').eq('status', 'live');
    for (const c of data ?? []) entries.push({ url: `${SITE_URL}/campaigns/${c.slug}`, lastModified: c.updated_at ? new Date(c.updated_at) : now, changeFrequency: 'daily', priority: 0.9 });
  } catch (error) {
    console.error('sitemap_campaigns_failed', error);
  }
  return entries;
}
