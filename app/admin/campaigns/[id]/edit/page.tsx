import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireStaff(['admin', 'super_admin']);
  const s = createServiceClient();
  const { data: c } = await s.from('campaigns').select('*,beneficiaries(*),payment_destinations(*)').eq('id', id).maybeSingle();
  if (!c) notFound();

  async function save(formData: FormData) {
    'use server';
    const staff = await requireStaff(['admin', 'super_admin']);
    const service = createServiceClient();
    const { data: before } = await service.from('campaigns').select('*').eq('id', id).single();
    const patch = {
      title: String(formData.get('title') || ''),
      summary: String(formData.get('summary') || ''),
      story: String(formData.get('story') || ''),
      category: String(formData.get('category') || ''),
      location: String(formData.get('location') || ''),
      target_cents: Math.max(100, Math.round(Number(formData.get('target') || 1) * 100)),
      risk_level: String(formData.get('risk_level') || 'standard'),
      risk_reason: String(formData.get('risk_reason') || ''),
      updated_at: new Date().toISOString(),
    };
    await service.from('campaigns').update(patch).eq('id', id);

    if (c.beneficiary_id) {
      await service.from('beneficiaries').update({
        display_name: String(formData.get('beneficiary') || ''),
        legal_name: String(formData.get('beneficiary_legal') || ''),
        country_code: String(formData.get('beneficiary_country') || 'NZ'),
        updated_at: new Date().toISOString(),
      }).eq('id', c.beneficiary_id);
    }

    if (c.payment_destination_id) {
      const paymentStatus = String(formData.get('payment_status') || 'pending');
      await service.from('payment_destinations').update({
        account_holder_name: String(formData.get('account_holder') || ''),
        bank_name: String(formData.get('bank_name') || ''),
        bank_account_number: String(formData.get('bank_account_number') || ''),
        verification_status: paymentStatus,
        is_active: true,
        last_verified_at: paymentStatus === 'verified' ? new Date().toISOString() : null,
      }).eq('id', c.payment_destination_id);
    }

    await service.from('audit_events').insert({
      actor_user_id: staff.user.id,
      campaign_id: id,
      event_type: 'admin_campaign_master_edit',
      entity_type: 'campaign',
      entity_id: id,
      metadata: { before: { title: before?.title, target_cents: before?.target_cents, risk_level: before?.risk_level }, after: patch },
    });
    revalidatePath(`/admin/campaigns/${id}`);
    redirect(`/admin/campaigns/${id}`);
  }

  return <section className="section"><div className="shell"><h1>Master campaign edit</h1><p className="muted">{c.reference_code}</p><AdminNav/><form action={save} className="form card manage-card"><label>Title<input name="title" defaultValue={c.title} required/></label><label>Summary<textarea name="summary" rows={3} defaultValue={c.summary} required/></label><label>Story and use of funds<textarea name="story" rows={12} defaultValue={c.story} required/></label><div className="field-grid"><label>Category<input name="category" defaultValue={c.category}/></label><label>Location<input name="location" defaultValue={c.location||''}/></label><label>Target NZD<input name="target" type="number" min="1" defaultValue={c.target_cents?c.target_cents/100:1}/></label><label>Risk level<select name="risk_level" defaultValue={c.risk_level}><option value="standard">Standard</option><option value="enhanced">Enhanced</option><option value="restricted">Restricted</option></select></label></div><label>Risk reason<textarea name="risk_reason" rows={3} defaultValue={c.risk_reason||''}/></label><h2>Beneficiary</h2><div className="field-grid"><label>Display name<input name="beneficiary" defaultValue={c.beneficiaries?.display_name||''}/></label><label>Legal name<input name="beneficiary_legal" defaultValue={c.beneficiaries?.legal_name||''}/></label><label>Country code<input name="beneficiary_country" defaultValue={c.beneficiaries?.country_code||'NZ'}/></label></div><h2>Bank payout destination</h2><div className="field-grid"><label>Account holder<input name="account_holder" defaultValue={c.payment_destinations?.account_holder_name||''}/></label><label>Bank name<input name="bank_name" defaultValue={c.payment_destinations?.bank_name||''}/></label><label>Bank account number<input name="bank_account_number" defaultValue={c.payment_destinations?.bank_account_number||''}/></label><label>Verification<select name="payment_status" defaultValue={c.payment_destinations?.verification_status||'pending'}><option value="pending">Pending</option><option value="verified">Verified</option><option value="needs_information">Needs information</option><option value="failed">Failed</option></select></label></div><div className="notice warning">Bank payout information is used for manual beneficiary transfers by Webfit Solutions Limited. Changes are audited and must be reverified before payout.</div><button className="button">Save master changes</button></form></div></section>;
}
