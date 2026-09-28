import { AuthForm } from '@/components/auth/AuthForm';
import { getCurrentUser } from '@/lib/auth';

async function SignedInNotice(){
  const current=await getCurrentUser().catch(()=>null);
  if(!current) return null;
  const role=current.profile?.role;
  return <div className="notice warning" style={{maxWidth:560,margin:'0 auto 20px'}}><strong>You are already signed in as {current.user.email}{role&&role!=='fundraiser'?` (${String(role).replace('_',' ')})`:''}.</strong> To use a different account, <a className="text-link" href="/auth/signout">log out first</a>.</div>;
}

import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/login', title: 'Log in', description: 'Good Cause account access.', noindex: true });
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}){const p=await searchParams;return <section className="auth-page"><SignedInNotice/><AuthForm mode="login" next={p.next||'/dashboard'}/></section>}
