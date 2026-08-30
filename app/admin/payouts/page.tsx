import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/admin/AdminNav';

export default async function Page() {
  await requireStaff(['finance', 'admin', 'super_admin']);
  const s = createServiceClient();
  const { data: rowsData } = await s.from('payouts').select('*,campaigns(title,reference_code),beneficiaries(display_name),payment_destinations(account_holder_name,bank_name,bank_account_number)').order('created_at', { ascending: false });
  const rows = rowsData ?? [];

  async function update(formData: FormData) {
    'use server';
    const staff = await requireStaff(['finance', 'admin', 'super_admin']);
    const service = createServiceClient();
    const id = String(formData.get('id'));
    const status = String(formData.get('status'));
    const bankTransferReference = String(formData.get('bank_transfer_reference') || '').trim();
    if (!['held', 'under_review', 'approved', 'paid', 'reversed'].includes(status)) return;
    if (status === 'paid' && !bankTransferReference) return;

    await service.from('payouts').update({
      status,
      bank_transfer_reference: bankTransferReference || null,
      reviewed_by: staff.user.id,
      reviewed_at: new Date().toISOString(),
      paid_at: status === 'paid' ? new Date().toISOString() : null,
    }).eq('id', id);

    await service.from('audit_events').insert({
      actor_user_id: staff.user.id,
      event_type: 'payout_status_changed',
      entity_type: 'payout',
      entity_id: id,
      metadata: { status, bank_transfer_reference: bankTransferReference || null, payout_method: 'manual_bank_transfer' },
    });
    revalidatePath('/admin/payouts');
  }

  return <section className="section"><div className="shell"><h1>Payouts</h1><AdminNav/><div className="card review-table-wrap"><table className="review-table"><thead><tr><th>Campaign</th><th>Beneficiary</th><th>Bank destination</th><th>Amount</th><th>Status</th><th>Control</th></tr></thead><tbody>{rows.map((r:any)=><tr key={r.id}><td>{r.campaigns?.title}<small>{r.campaigns?.reference_code}</small></td><td>{r.beneficiaries?.display_name}</td><td>{r.payment_destinations?.account_holder_name}<small>{r.payment_destinations?.bank_name} · {r.payment_destinations?.bank_account_number}</small></td><td>NZ${(r.amount_cents/100).toFixed(2)}</td><td>{r.status}</td><td><form action={update} className="inline-form"><input type="hidden" name="id" value={r.id}/><select name="status" defaultValue={r.status}><option value="held">Held</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="paid">Paid</option><option value="reversed">Reversed</option></select><input name="bank_transfer_reference" defaultValue={r.bank_transfer_reference||''} placeholder="Bank transfer reference"/><button className="button small">Save</button></form></td></tr>)}</tbody></table></div></div></section>;
}
