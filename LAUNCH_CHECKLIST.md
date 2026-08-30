# Good Cause launch checklist

## Product
- [ ] Complete Supabase authentication and final RLS policies
- [ ] Add secure campaign application submission
- [ ] Add secure verification-document workflow
- [ ] Add moderation queue and audit log
- [ ] Add donor receipts and email notifications
- [ ] Add campaign updates and reporting workflow

## Payments
- [ ] Stripe approval complete
- [ ] Connect architecture implemented
- [ ] Fees reconciled using actual provider transaction data
- [ ] Refund and dispute workflows tested
- [ ] Payout holds and reserve rules implemented

## Legal and finance
- [ ] New Zealand lawyer reviews public legal pages
- [ ] Accountant confirms principal/agent accounting treatment
- [ ] GST wording confirmed
- [ ] AML/CFT applicability formally assessed
- [ ] Overseas campaigns and sanctions process approved
- [ ] Privacy officer/process assigned

## Security
- [ ] MFA required for administrators
- [ ] Supabase RLS penetration review
- [ ] Secrets only in Vercel environment variables
- [ ] Rate limiting and abuse controls
- [ ] Backups and incident response tested

## Fundraiser onboarding and compliance

- [ ] Configure Supabase Auth for fundraiser accounts
- [ ] Configure verified email and mobile workflow
- [ ] Create private `verification-documents` Storage bucket
- [ ] Implement secure document upload with file-type and size restrictions
- [ ] Implement authorised reviewer signed-URL access
- [ ] Finalise fundraiser types and required check matrix
- [ ] Finalise enhanced-review triggers with legal/compliance advice
- [ ] Implement beneficiary consent verification procedure
- [ ] Implement payment-destination verification procedure
- [ ] Implement immutable review/audit event logging
- [ ] Implement Request Information notifications and resubmission
- [ ] Implement server-side donation eligibility check
- [ ] Implement separate payout approval and re-verification controls
- [ ] Test suspension so a live campaign immediately stops accepting donations
