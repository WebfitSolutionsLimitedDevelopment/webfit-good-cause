import { PasswordReset } from '@/components/auth/PasswordReset';export default function Page(){return <section className="auth-page"><PasswordReset mode="update"/></section>}

import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ path: '/reset-password', title: 'Choose a new password', description: 'Good Cause account access.', noindex: true });
