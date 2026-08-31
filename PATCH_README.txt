Production-based repair patch created from webfit-good-cause-main.zip.

What it does:
1. Forces the dashboard to load fresh campaign data.
2. Super Admin and Admin can see all campaigns in the CMS.
3. Super Admin keeps direct editing/publishing behaviour.
4. Includes an idempotent SQL repair to ensure Nepal Flash Flood Relief Appeal 2026 and ONE MORE GIFT 2026 both exist and are live.
5. Existing campaign IDs, content, donations and media are preserved when the campaign already exists.

After applying the code patch and deploying, run sql/ensure_core_live_campaigns.sql once in the production Supabase SQL Editor.
