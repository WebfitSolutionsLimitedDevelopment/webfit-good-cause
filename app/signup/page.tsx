import { AuthForm } from '@/components/auth/AuthForm';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/signup', title: 'Create an account', description: 'Good Cause account access.', noindex: true });
export default function Signup(){return <section className="auth-page"><AuthForm mode="signup"/></section>}
