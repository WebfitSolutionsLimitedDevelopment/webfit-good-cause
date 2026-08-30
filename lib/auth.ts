import { redirect } from 'next/navigation';
import { createServerSupabaseClient, createServiceClient } from './supabase-server';

export type AppRole = 'fundraiser'|'reviewer'|'finance'|'admin'|'super_admin';

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const service = createServiceClient();
  const { data: profile } = await service.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return { user, profile };
}

export async function requireUser() {
  const current = await getCurrentUser();
  if (!current) redirect('/login?next=/dashboard');
  return current;
}

export async function requireStaff(allowed: AppRole[] = ['reviewer','finance','admin','super_admin']) {
  const current = await getCurrentUser();
  if (!current) redirect('/admin/login');
  const role = current.profile?.role as AppRole | undefined;
  if (!role || !allowed.includes(role)) redirect('/dashboard');
  if (process.env.ADMIN_MFA_REQUIRED !== 'false') {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data?.currentLevel !== 'aal2') redirect('/admin/mfa');
  }
  return { ...current, role };
}

export async function requireStaffForMfa() {
  const current = await getCurrentUser();
  if (!current) redirect('/admin/login');
  const role = current.profile?.role as AppRole | undefined;
  if (!role || !['reviewer','finance','admin','super_admin'].includes(role)) redirect('/dashboard');
  return { ...current, role };
}

export function canManageCampaign(role?: string) {
  return role === 'admin' || role === 'super_admin';
}

export function canManagePayouts(role?: string) {
  return role === 'finance' || role === 'admin' || role === 'super_admin';
}
