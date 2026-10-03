import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createServiceClient } from '@/lib/supabase-server';
import { notifyAdmins } from '@/lib/notifications';
import { ORG_TYPES, slugify, type OrgPage } from '@/lib/organisations';

const clean = (v: FormDataEntryValue | null, max: number) => String(v ?? '').trim().slice(0, max);

export default async function OrganisationEditor({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const sp = await searchParams;
  const { user } = await requireUser();
  const db = createServiceClient();
  const { data } = await db.from('organisation_pages').select('*').eq('owner_id', user.id).maybeSingle();
  const org = data as OrgPage | null;

  async function save(formData: FormData) {
    'use server';
    const { user } = await requireUser();
    const db = createServiceClient();
    const name = clean(formData.get('name'), 120);
    const about = clean(formData.get('about'), 3000);
    const org_type = ORG_TYPES[clean(formData.get('org_type'), 30)] ? clean(formData.get('org_type'), 30) : 'community';
    let website = clean(formData.get('website'), 200);
    if (website && !/^https?:\/\//i.test(website)) website = `https://${website}`;
    if (name.length < 3 || about.length < 40) redirect('/dashboard/organisation?error=1');
    const fields = { name, about, org_type, location: clean(formData.get('location'), 80) || null, website: website || null, charity_number: clean(formData.get('charity_number'), 30) || null, status: 'pending', reviewer_note: null, updated_at: new Date().toISOString() };
    const { data: existing } = await db.from('organisation_pages').select('id,slug').eq('owner_id', user.id).maybeSingle();
    let id = existing?.id;
    if (existing) await db.from('organisation_pages').update(fields).eq('id', existing.id);
    else {
      let slug = slugify(name);
      const { data: taken } = await db.from('organisation_pages').select('id').eq('slug', slug).maybeSingle();
      if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      const { data: created } = await db.from('organisation_pages').insert({ ...fields, owner_id: user.id, slug }).select('id').single();
      id = created?.id;
    }
    await db.from('audit_events').insert({ actor_user_id: user.id, event_type: 'organisation_page_submitted', entity_type: 'organisation_page', entity_id: id, metadata: { name } });
    await notifyAdmins({ type: 'organisation_page_submitted', title: `Organisation page awaiting review: ${name}`, message: `${name} submitted an organisation page for review.`, link: '/admin/organisations' });
    revalidatePath('/dashboard/organisation');
    redirect('/dashboard/organisation?saved=1');
  }

  const statusText: Record<string, string> = { pending: 'Waiting for review. We will email you when it is checked.', approved: 'Published.', rejected: 'Not approved. See the note below, update the page and submit again.', draft: 'Draft.' };
  return <section className="section"><div className="shell" style={{ maxWidth: 820 }}>
    <h1>Organisation page</h1>
    <p className="muted">For charities, schools, clubs, marae, churches and community groups. Your page lists all your live appeals in one place. Every change is checked before it is published.</p>
    {sp.saved && <div className="notice">Thanks. Your page has been sent for review.</div>}
    {sp.error && <div className="notice warning">Please enter a name and at least a couple of sentences about your organisation.</div>}
    {org && <div className="card" style={{ padding: 18, margin: '18px 0' }}><strong>Status: {org.status}</strong><p className="muted">{statusText[org.status]}</p>{org.reviewer_note && <p>Note from Good Cause: {org.reviewer_note}</p>}{org.status === 'approved' && <p><Link href={`/organisations/${org.slug}`}>View your public page</Link></p>}</div>}
    <form action={save} className="form card" style={{ padding: 22 }}>
      <label>Organisation name<input name="name" required defaultValue={org?.name || ''} /></label>
      <label>Type<select name="org_type" defaultValue={org?.org_type || 'community'}>{Object.entries(ORG_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label>Town or city<input name="location" defaultValue={org?.location || ''} placeholder="e.g. Hamilton" /></label>
      <label>About your organisation<textarea name="about" rows={7} required defaultValue={org?.about || ''} placeholder="Who you are, who you help and what you raise money for." /></label>
      <label>Website (optional)<input name="website" defaultValue={org?.website || ''} placeholder="https://" /></label>
      <label>Charities Services registration number (optional)<input name="charity_number" defaultValue={org?.charity_number || ''} placeholder="e.g. CC12345" /></label>
      <p className="fineprint">Only publish information you are happy to be public. Do not include personal phone numbers or home addresses.</p>
      <button className="button">{org ? 'Save and send for review' : 'Create page and send for review'}</button>
    </form>
  </div></section>;
}
