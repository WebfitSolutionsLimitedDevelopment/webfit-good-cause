import { PasswordReset } from '@/components/auth/PasswordReset';export default function Page(){return <section className="auth-page"><PasswordReset mode="request"/></section>}

import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/forgot-password', title: 'Reset your password', description: 'Good Cause account access.', noindex: true });
