Good Cause production PDF receipt and email fix

Changes:
- Attaches a real PDF contribution receipt to the contributor email.
- Uses the Good Cause website logo in the PDF.
- Replaces the large HTML receipt body with a short thank-you email.
- Makes the admin payment email mobile-safe so long values wrap instead of being cropped.
- Removes the visible placeholder business-address problem from the receipt output.
- Keeps tax wording factual and does not falsely claim NZ donation tax-credit eligibility.

No database, Stripe payment, campaign, payout or Supabase schema changes.

Business address behavior:
- If GOODCAUSE_BUSINESS_ADDRESS contains a real address, the PDF prints it.
- If it is blank or still contains placeholder text, the PDF safely prints New Zealand instead.
