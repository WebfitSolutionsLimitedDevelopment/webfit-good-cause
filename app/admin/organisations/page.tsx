import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { requireStaff } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { AdminNav } from '@/components/admin/AdminNav';
import { createNotification } from '@/lib/notifications';
import { pingIndexNow } from '@/lib/indexnow';
import { ORG_TYPES, type OrgPage } from '@/lib/organisations';

export default async function AdminOrganisations() {
  await requireStaff(['reviewer', 'admin', 'super_admin']);
  const db = createServiceClient();
  const { data } = await db.from('organisation_pages').select('*').order('updated_at', { ascending: false });
  const rows = (data ?? []) as OrgPage[];

  async function review(formData: FormData) {
    'use server';
    const staff = await requireStaff(['reviewer', 'admin', 'super_admin']);
    const db = createServiceClient();
    const id = String(formData.get('id') || '');
    const decision = String(formData.get('decision') || '');
    const note = String(formData.get('note') || '').trim();
    if (!['approved', 'rejected'].includes(decision) || (decision === 'rejected' && !note)) return;
    const { data: org } = await db.from('organisation_pages').update({ status: decision, reviewer_note: note || null, reviewed_by: staff.user.id, reviewed_at: new Date().toISOString() }).eq('id', id).select('owner_id,name,slug').maybeSingle();
    if (!org) return;
    await db.from('audit_events').insert({ actor_user_id: staff.user.id, event_type: `organisation_page_${decision}`, entity_type: 'organisation_page', entity_id: id, metadata: { note } });
    const { data: owner } = await db.from('profiles').select('email').eq('id', org.owner_id).maybeSingle();
    await createNotification({ userId: org.owner_id, type: 'organisation_page_reviewed', title: decision === 'approved' ? `Your organisation page is live: ${org.name}` : `Organisation page not approved: ${org.name}`, message: decision === 'approved' ? `Your page is now public. Share it so supporters can see all your appeals in one place.${note ? `\nNote: ${note}` : ''}` : `Please update your page and submit it again.\nNote from Good Cause: ${note}`, email: owner?.email || null, link: decision === 'approved' ? `/organisations/${org.slug}` : '/dashboard/organisation', ctaLabel: decision === 'approved' ? 'View your page' : 'Update your page' });
    if (decision === 'approved') await pingIndexNow([`/organisations/${org.slug}`, '/organisations']);
    revalidatePath('/admin/organisations');
  }

  return <section className="section"><div className="shell"><h1>Organisation pages</h1><AdminNav />
    {rows.length === 0 ? <p className="muted">No organisation pages yet.</p> : rows.map((o) => <div className="card case-card" key={o.id} style={{ padding: 18, marginBottom: 14 }}>
      <h3>{o.name} <small className="muted">· {ORG_TYPES[o.org_type] || o.org_type} · {o.status}</small></h3>
      <p className="muted">{o.location || 'No location'}{o.website ? ` · ${o.website}` : ''}{o.charity_number ? ` · Charity no. ${o.charity_number}` : ''}</p>
      <p style={{ whiteSpace: 'pre-wrap' }}>{o.about}</p>
      {o.status === 'approved' && <p><Link href={`/organisations/${o.slug}`}>View public page</Link></p>}
      <form action={review} className="inline-form"><input type="hidden" name="id" value={o.id} />
        <select name="decision" defaultValue="approved"><option value="approved">Approve and publish</option><option value="rejected">Reject</option></select>
        <input name="note" placeholder="Note to organiser (required to reject)" defaultValue={o.reviewer_note || ''} />
        <button className="button small">Save</button></form>
    </div>)}
  </div></section>;
}
