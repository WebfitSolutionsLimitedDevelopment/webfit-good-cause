import { AuthForm } from '@/components/auth/AuthForm';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/login', title: 'Log in', description: 'Good Cause account access.', noindex: true });
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}){const p=await searchParams;return <section className="auth-page"><AuthForm mode="login" next={p.next||'/dashboard'}/></section>}
