# Good Cause

Good Cause is the Webfit News community fundraising platform operated by Webfit Solutions Limited. The application uses Next.js 15, Supabase, Stripe, Resend, Vercel and GitHub.

## Production capabilities

Fundraisers can create accounts, verify email, submit campaigns, manage their own campaigns, publish updates, upload private verification evidence, see donation records and follow payout status.

Staff access is role based. Reviewer, finance, admin and super admin roles are supported. Administrative access requires Supabase MFA by default. Admin actions, campaign changes, compliance decisions, user role changes and payout changes are written to the audit log.

Public donations are available only when a campaign is live, every required compliance check is verified and the beneficiary bank payout destination has been verified.

## Environment setup

Replace every placeholder in `.env` for production. Use `.env.local` for local development. `.env.example` and `.env.local.template` contain the same variable names without production credentials.

Do not place real service-role, Stripe secret, webhook, Resend or internal secret values in GitHub.

## Supabase setup

1. Create the Supabase project.
2. Run `sql/schema.sql` in the Supabase SQL editor.
3. Enable Email authentication.
4. Set the Site URL to `https://goodcause.webfitnews.co.nz`.
5. Add `https://goodcause.webfitnews.co.nz/auth/callback` to allowed redirect URLs.
6. Configure Supabase Auth SMTP with Resend if you want verification and password-reset email to use the Good Cause sending domain.
7. Keep the `verification-documents` bucket private. The schema creates the bucket if storage is available.

## First super admin and Nepal appeal

1. Deploy the app or run it locally.
2. Create the first administrator account through `/signup` using the email entered in `INITIAL_SUPER_ADMIN_EMAIL`.
3. Verify the email.
4. Replace `NEPAL_BENEFICIARY_NAME` with the verified beneficiary or humanitarian relief partner.
5. Verify the beneficiary bank destination in the Good Cause admin portal before enabling donations.
6. Run `npm run bootstrap:production` using the production `.env` file.

The bootstrap command promotes the selected account to `super_admin` and creates the Nepal flood campaign as live only after all required bootstrap placeholders have been replaced.

## Stripe

Set `PAYMENTS_ENABLED=true` only for the approved production account. Configure the production webhook endpoint:

`https://goodcause.webfitnews.co.nz/api/stripe/webhook`

Add the resulting signing secret to `STRIPE_WEBHOOK_SECRET`.

For each donation, Good Cause calculates the 2.5% platform fee. The Stripe webhook obtains the actual processing fee from the settled charge and records the remaining amount as a pending bank payout liability for the verified beneficiary.

## Resend

Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_REPLY_TO_EMAIL`, `GOODCAUSE_SUPPORT_EMAIL` and `GOODCAUSE_COMPLIANCE_EMAIL`.

Campaign submission and moderation decisions send workflow email through Resend. Supabase authentication email is configured separately through Supabase Auth SMTP.

## Vercel

Import the GitHub repository into Vercel and add the same production environment variables under Project Settings > Environment Variables. Point `goodcause.webfitnews.co.nz` to the Vercel project.

## Production checks

Run:

```bash
npm install
npm run build
npm start
```

Test fundraiser signup, email verification, password reset, organiser campaign submission, private evidence upload, admin MFA, campaign approval, Stripe Checkout, webhook processing, manual bank payout workflow, audit events and Resend email before accepting public donations.

## Contributor receipt and privacy flow

The production contribution form collects the contributor's full name, email address and mobile number before Stripe Checkout. The contributor can choose `Hide my name publicly`. That preference is stored with the payment metadata and donation record.

After Stripe confirms a successful payment through the webhook, Good Cause records the actual Stripe processing fee, calculates the 2.5% platform fee, records the net amount for manual bank payout to the verified beneficiary, generates a unique Good Cause receipt number and sends a contribution receipt through Resend. The receipt is a payment/contribution receipt and is not represented as a tax-deductible donation receipt unless the beneficiary's status independently supports that treatment.

The public campaign page displays only the latest contributor. If the latest contributor selected the privacy option, the public label is `Anonymous supporter`. Names, email addresses and mobile numbers are never exposed through the public campaign interface.

Required webhook events: `checkout.session.completed` and `checkout.session.async_payment_succeeded`.

## Production governance controls

Good Cause uses an approval-first publishing model. After submission, organiser edits do not modify the public campaign directly. Text changes, target changes, beneficiary changes, payout-related changes, cover images, campaign media and campaign updates are held for admin approval. Administrators receive email and in-app notifications for new campaign applications, verification documents, organiser change requests, campaign media, campaign updates, query responses and successful contributions.

Fundraisers can self-onboard through `/signup` and `/start`. Verification documents are stored in the private `verification-documents` Supabase bucket. Campaign images are stored in the private `campaign-media` bucket. Video and news/article references can be submitted as URLs and are also moderated before publication.

For an existing v6 Supabase project, run `sql/v7_governance_upgrade.sql` once before deploying this version. For a new project, run the complete `sql/schema.sql`.
