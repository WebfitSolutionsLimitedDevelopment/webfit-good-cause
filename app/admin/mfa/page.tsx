import { requireStaffForMfa } from '@/lib/auth';import { AdminMfa } from '@/components/auth/AdminMfa';
export default async function Page(){await requireStaffForMfa();return <section className="auth-page"><AdminMfa/></section>}
