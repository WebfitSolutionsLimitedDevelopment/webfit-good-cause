import { randomBytes } from 'crypto';
import { createServiceClient } from './supabase-server';
import { sendEmail, sendEmailBatch, workflowEmailHtml } from './email';
import { SITE_URL } from './seo';

const RESEND_CONFIRM_AFTER_MS = 10 * 60 * 1000;

function unsubscribeLinks(token: string) {
  return { page: `${SITE_URL}/follow/unsubscribe?token=${token}`, oneClick: `${SITE_URL}/api/follow/unsubscribe?token=${token}` };
}

/** Starts a double opt-in follow. Never reveals whether the email already follows. */
export async function requestFollow(campaignId: string, campaignTitle: string, email: string) {
  const db = createServiceClient();
  const { data: existing } = await db.from('campaign_followers').select('id,token,confirmed_at,unsubscribed_at,last_sent_at').eq('campaign_id', campaignId).eq('email', email).maybeSingle();
  if (existing?.confirmed_at && !existing.unsubscribed_at) return;
  if (existing?.last_sent_at && Date.now() - new Date(existing.last_sent_at).getTime() < RESEND_CONFIRM_AFTER_MS) return;

  const token = existing?.token || randomBytes(24).toString('hex');
  if (existing) await db.from('campaign_followers').update({ unsubscribed_at: null, confirmed_at: null, last_sent_at: new Date().toISOString() }).eq('id', existing.id);
  else {
    const { error } = await db.from('campaign_followers').insert({ campaign_id: campaignId, email, token, last_sent_at: new Date().toISOString() });
    if (error) { console.error('follow_insert_failed', error.message); throw new Error('follow_failed'); }
  }
  const link = `${SITE_URL}/follow/confirm?token=${token}`;
  await sendEmail({
    to: email,
    subject: `Confirm: follow ${campaignTitle}`,
    html: workflowEmailHtml({ heading: 'Confirm you want updates', message: `You asked to get email updates about "${campaignTitle}" on Good Cause.\nPress the button to confirm. You can unsubscribe at any time.\nIf this was not you, ignore this email and you will not hear from us.`, ctaLabel: 'Yes, send me updates', ctaUrl: link }),
    text: `Confirm you want updates about "${campaignTitle}": ${link}`,
  });
}

export async function confirmFollow(token: string) {
  const db = createServiceClient();
  const { data } = await db.from('campaign_followers').update({ confirmed_at: new Date().toISOString(), unsubscribed_at: null }).eq('token', token).select('campaign_id,campaigns(title,slug)').maybeSingle();
  return data as { campaign_id: string; campaigns: { title: string; slug: string } | null } | null;
}

export async function unsubscribeFollow(token: string) {
  const db = createServiceClient();
  const { data } = await db.from('campaign_followers').update({ unsubscribed_at: new Date().toISOString() }).eq('token', token).select('id,campaigns(title,slug)').maybeSingle();
  return data as { id: string; campaigns: { title: string; slug: string } | null } | null;
}

/** Emails every confirmed follower when an update is published. Returns how many were sent. */
export async function notifyFollowers(campaignId: string, update: { title: string; body: string }) {
  const db = createServiceClient();
  const [{ data: campaign }, { data: followers }] = await Promise.all([
    db.from('campaigns').select('title,slug,status').eq('id', campaignId).maybeSingle(),
    db.from('campaign_followers').select('email,token').eq('campaign_id', campaignId).not('confirmed_at', 'is', null).is('unsubscribed_at', null),
  ]);
  if (!campaign || campaign.status !== 'live' || !followers?.length) return 0;
  const url = `${SITE_URL}/campaigns/${campaign.slug}`;
  const excerpt = update.body.length > 600 ? `${update.body.slice(0, 600).trim()}…` : update.body;
  const emails = followers.map((f) => {
    const u = unsubscribeLinks(f.token);
    return {
      to: f.email,
      subject: `Update: ${campaign.title}`,
      html: workflowEmailHtml({ heading: update.title, message: `New update from "${campaign.title}":\n${excerpt}\nYou are getting this because you chose to follow this campaign. Unsubscribe: ${u.page}`, ctaLabel: 'Read the update and donate', ctaUrl: url }),
      text: `${update.title}\n\n${excerpt}\n\nRead more: ${url}\n\nUnsubscribe: ${u.page}`,
      headers: { 'List-Unsubscribe': `<${u.oneClick}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    };
  });
  const sent = await sendEmailBatch(emails).catch((error) => { console.error('follower_batch_failed', String(error)); return 0; });
  return sent;
}
