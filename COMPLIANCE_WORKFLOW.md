# Good Cause campaign governance workflow

## Self onboarding

A fundraiser creates their own Good Cause account with full name, mobile number, email and password. Email verification is handled by Supabase Auth. The fundraiser then completes the campaign application, beneficiary details, fundraising purpose, target, payment destination information and required declarations.

The submitted application creates a compliance case automatically. Good Cause administrators are notified by email and in the admin notification centre. The fundraiser can upload verification evidence from their dashboard. Verification files are stored in the private `verification-documents` Supabase Storage bucket.

No submitted campaign can accept donations until the required compliance checks are verified and an authorised reviewer approves the campaign.

## Admin review states

Administrators can work through the compliance checklist and place a campaign into submitted, under review, more information required, enhanced review, live, suspended or rejected states. Reviewers can mark individual checks pending, verified, needs information, failed or expired and record a reviewer note.

Administrators can raise a structured query from the campaign review page. The fundraiser sees the query in their portal, provides a response and can upload additional evidence. Admin receives a notification when the fundraiser responds. Queries remain in the audit history after resolution.

## Changes to an existing campaign

After a campaign has been submitted, organisers do not overwrite the approved public record directly. Any edit creates a `campaign_change_requests` record. The approved public campaign continues to display unchanged while the request is pending.

This applies to title, summary, story, fundraising purpose, category, location, target, beneficiary details and expected payout account-holder information. Beneficiary and payout-related requests are treated as sensitive changes. Pending payouts can be held and the relevant compliance checks are returned to pending when a sensitive change is approved so reverification can occur.

Admin receives both email and in-app notification of each change request. An authorised reviewer must approve or reject it. The action, reviewer, proposed values and decision are recorded in the audit log.

## Images, video and news references

Organisers can submit campaign images, video links and news/article links from the campaign dashboard. Uploaded images are stored privately in the `campaign-media` Supabase Storage bucket. Media is created with pending status and is not rendered publicly until admin approval.

An organiser can nominate an uploaded image as the campaign cover. A new cover does not replace the approved cover until review is complete. Video and article links are also moderated before publication.

## Campaign updates

Campaign updates are submitted with pending status. They remain private until an administrator approves them. Rejected updates remain visible to the organiser with the reviewer note but do not appear on the public campaign page.

## Donations and notifications

Stripe webhook confirmation is the source of truth for successful contributions. After payment confirmation, Good Cause records the contribution, actual processor fee, 2.5% platform fee, net campaign amount, donor details and receipt number. The donor receives the contribution receipt by email.

The campaign organiser receives an email and portal notification for every successful contribution. Good Cause admins receive an email and portal notification for the same event. Full transaction history remains available in the organiser donation view and admin donation ledger.

Public campaign activity shows only the latest contributor. If that contributor selected the privacy checkbox, the public display reads `Anonymous supporter`.

## Audit requirements

Campaign submissions, document uploads, compliance decisions, queries, organiser responses, requested edits, media submissions, update submissions, payment events, approvals and rejections are written to `audit_events`. Sensitive evidence itself is not exposed publicly.
