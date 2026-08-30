import { createServiceClient } from './supabase-server';

export type PublicCampaign = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  story: string;
  category: string;
  location: string;
  raised: number;
  goal: number;
  donors: number;
  beneficiary: string;
  beneficiaryVerified: boolean;
  payoutVerified: boolean;
  lastContributor: string | null;
};

export async function getPublicCampaigns(): Promise<PublicCampaign[]> {
  const s = createServiceClient();
  const { data: rowsData } = await s
    .from('campaigns')
    .select('id,slug,title,summary,story,category,location,target_cents,beneficiaries(display_name,identity_status,consent_status),payment_destinations(verification_status,bank_name,bank_account_number)')
    .eq('status', 'live')
    .order('published_at', { ascending: false });

  const rows = rowsData ?? [];
  const out: PublicCampaign[] = [];

  for (const c of rows as any[]) {
    const { data: dData } = await s
      .from('donations')
      .select('amount_cents,donor_display_name,anonymous,created_at')
      .eq('campaign_id', c.id)
      .eq('status', 'succeeded')
      .order('created_at', { ascending: false });

    const d = dData ?? [];
    const latest = d[0];
    const beneficiaryVerified = c.beneficiaries?.identity_status === 'verified' && c.beneficiaries?.consent_status === 'verified';
    const payoutVerified = c.payment_destinations?.verification_status === 'verified'
      && Boolean(c.payment_destinations?.bank_name)
      && Boolean(c.payment_destinations?.bank_account_number);

    out.push({
      id: c.id,
      slug: c.slug,
      title: c.title,
      summary: c.summary,
      story: c.story,
      category: c.category,
      location: c.location || '',
      raised: d.reduce((a: number, x: any) => a + Number(x.amount_cents || 0), 0) / 100,
      goal: Number(c.target_cents || 0) / 100,
      donors: d.length,
      beneficiary: beneficiaryVerified ? (c.beneficiaries?.display_name || 'Verified beneficiary') : 'Beneficiary details being finalised',
      beneficiaryVerified,
      payoutVerified,
      lastContributor: latest ? (latest.anonymous ? 'Anonymous supporter' : latest.donor_display_name || 'Supporter') : null
    });
  }

  return out;
}

export async function getPublicCampaign(slug: string) {
  const all = await getPublicCampaigns();
  return all.find(x => x.slug === slug) || null;
}
