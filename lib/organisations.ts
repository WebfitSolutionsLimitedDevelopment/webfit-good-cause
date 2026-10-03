import { unstable_noStore as noStore } from 'next/cache';
import { createServiceClient } from './supabase-server';
import { getPublicCampaigns, type PublicCampaign } from './public-campaigns';

export const ORG_TYPES: Record<string, string> = {
  charity: 'Registered charity',
  school: 'School or kindergarten',
  club: 'Sports or community club',
  community: 'Community group',
  marae: 'Marae or iwi organisation',
  church: 'Church or faith group',
  business: 'Business',
};

export type OrgPage = {
  id: string; owner_id: string; slug: string; name: string; org_type: string; about: string;
  location: string | null; website: string | null; charity_number: string | null; status: string;
  reviewer_note: string | null; updated_at: string;
};

export function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'organisation';
}

export async function listApprovedOrgs(): Promise<OrgPage[]> {
  noStore();
  const { data } = await createServiceClient().from('organisation_pages').select('*').eq('status', 'approved').order('name');
  return (data ?? []) as OrgPage[];
}

export async function getApprovedOrg(slug: string) {
  noStore();
  const db = createServiceClient();
  const { data } = await db.from('organisation_pages').select('*').eq('slug', slug).eq('status', 'approved').maybeSingle();
  if (!data) return null;
  const org = data as OrgPage;
  const { data: owned } = await db.from('campaigns').select('slug').eq('owner_id', org.owner_id).eq('status', 'live');
  const slugs = new Set((owned ?? []).map((c) => c.slug));
  const campaigns: PublicCampaign[] = (await getPublicCampaigns()).filter((c) => slugs.has(c.slug));
  const { data: verified } = await db.from('fundraiser_profiles').select('authority_status').eq('user_id', org.owner_id).maybeSingle();
  return { org, campaigns, authorityVerified: verified?.authority_status === 'verified' };
}

export async function getApprovedOrgForOwner(ownerId: string) {
  const { data } = await createServiceClient().from('organisation_pages').select('slug,name').eq('owner_id', ownerId).eq('status', 'approved').maybeSingle();
  return data as { slug: string; name: string } | null;
}
