import FundraiserApplication from '@/components/onboarding/FundraiserApplication';
import { requireUser } from '@/lib/auth';
export default async function Start(){await requireUser();return <><section className="page-hero"><div className="shell"><div className="eyebrow">Start a cause</div><h1>Apply to fundraise with Good Cause</h1><p className="muted">Create your campaign and submit the information required for beneficiary, payment and compliance review.</p></div></section><section className="section"><div className="shell"><FundraiserApplication/></div></section></>}
