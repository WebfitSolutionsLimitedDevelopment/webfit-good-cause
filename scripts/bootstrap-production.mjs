import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.INITIAL_SUPER_ADMIN_EMAIL;
const beneficiaryName = process.env.NEPAL_BENEFICIARY_NAME;

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: url,
  SUPABASE_SERVICE_ROLE_KEY: key,
  INITIAL_SUPER_ADMIN_EMAIL: email,
  NEPAL_BENEFICIARY_NAME: beneficiaryName,
})) {
  if (!value || String(value).includes('REPLACE') || String(value).includes('YOUR_')) {
    throw new Error(`${name} must be replaced before bootstrap.`);
  }
}

const s = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: profiles, error: profileError } = await s.from('profiles').select('id,email').ilike('email', email).limit(1);
if (profileError) throw profileError;
const profile = profiles?.[0];
if (!profile) throw new Error(`No Good Cause profile found for ${email}. Create and verify the account first.`);

await s.from('profiles').update({ role: 'super_admin' }).eq('id', profile.id);

const { data: fp, error: fpErr } = await s.from('fundraiser_profiles').upsert({
  user_id: profile.id,
  fundraiser_type: 'organisation',
  legal_name: 'Webfit Solutions Limited',
  country_code: 'NZ',
  contact_status: 'verified',
  identity_status: 'verified',
}, { onConflict: 'user_id' }).select().single();
if (fpErr) throw fpErr;

const slug = 'nepal-flash-flood-relief-2026';
const { data: existing } = await s.from('campaigns').select('id').eq('slug', slug).maybeSingle();
if (existing) {
  console.log(`Super admin configured. Nepal campaign already exists: ${existing.id}`);
  process.exit(0);
}

const { data: b, error: bErr } = await s.from('beneficiaries').insert({
  display_name: beneficiaryName,
  legal_name: beneficiaryName,
  beneficiary_type: 'organisation',
  country_code: 'NP',
  relationship_to_fundraiser: 'Verified humanitarian beneficiary pending payout verification',
  consent_status: 'pending',
  identity_status: 'pending',
}).select().single();
if (bErr) throw bErr;

const { data: pd, error: pdErr } = await s.from('payment_destinations').insert({
  beneficiary_id: b.id,
  provider: 'bank_transfer',
  account_holder_name: beneficiaryName,
  country_code: 'NP',
  currency: 'NZD',
  verification_status: 'pending',
  is_active: true,
}).select().single();
if (pdErr) throw pdErr;

const story = `Severe flash floods and debris flows struck northern Nepal in late August 2026, damaging homes, roads, bridges, water systems and other essential infrastructure.\n\nThis appeal is intended to support verified humanitarian relief for people affected by the floods. Funds may be used for urgent shelter, safe water, sanitation, health support, protection and essential relief according to the verified beneficiary's response plan.\n\nGood Cause applies its 2.5% platform fee and the actual payment-processing cost. The remaining amount is recorded for manual bank payout to the verified beneficiary after payout controls are completed.`;

const { data: c, error: cErr } = await s.from('campaigns').insert({
  owner_id: profile.id,
  fundraiser_profile_id: fp.id,
  beneficiary_id: b.id,
  payment_destination_id: pd.id,
  slug,
  reference_code: 'GC-NEPAL-2026',
  title: 'Nepal Flash Flood Relief Appeal 2026',
  summary: 'Support verified humanitarian relief for communities affected by severe flash floods in northern Nepal.',
  story,
  category: 'Emergency relief',
  location: 'Northern Nepal',
  target_cents: 10000000,
  currency: 'NZD',
  status: 'under_review',
  risk_level: 'enhanced',
  risk_reason: 'International emergency-relief campaign requires enhanced beneficiary and bank payout verification.',
}).select().single();
if (cErr) throw cErr;

const checks = ['identity', 'beneficiary', 'beneficiary_consent', 'payment_destination', 'purpose_evidence', 'risk_screening', 'human_review'].map(check_key => ({
  campaign_id: c.id,
  check_key,
  label: check_key.replaceAll('_', ' '),
  required: true,
  status: 'pending',
}));
await s.from('compliance_checks').insert(checks);
await s.from('audit_events').insert({
  actor_user_id: profile.id,
  campaign_id: c.id,
  event_type: 'production_bootstrap_nepal_campaign',
  entity_type: 'campaign',
  entity_id: c.id,
  metadata: { slug, payout_method: 'manual_bank_transfer' },
});

console.log(`Bootstrap complete. Super admin: ${email}. Nepal campaign created under review: ${c.id}`);
