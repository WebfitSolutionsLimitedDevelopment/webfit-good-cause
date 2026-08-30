import { AuthForm } from '@/components/auth/AuthForm';
export default async function Login({searchParams}:{searchParams:Promise<{next?:string}>}){const p=await searchParams;return <section className="auth-page"><AuthForm mode="login" next={p.next||'/dashboard'}/></section>}
