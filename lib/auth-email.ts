import { sendEmail, workflowEmailHtml } from './email';
import { SITE_URL } from './seo';

export type AuthLinkType = 'signup' | 'recovery' | 'magiclink';

export function safeNext(value: unknown, fallback = '/dashboard') {
  const next = String(value || '');
  return next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

export function confirmUrl(tokenHash: string, type: AuthLinkType, next: string) {
  const params = new URLSearchParams({ token_hash: tokenHash, type, next });
  return `${SITE_URL}/auth/confirm?${params.toString()}`;
}

const COPY: Record<AuthLinkType, { subject: string; heading: string; message: string; cta: string }> = {
  signup: {
    subject: 'Confirm your Good Cause account',
    heading: 'Confirm your email address',
    message: 'Thanks for creating a Good Cause account. Please confirm your email address to finish signing up.\nIf you did not create this account, you can ignore this email.',
    cta: 'Confirm my email',
  },
  magiclink: {
    subject: 'Your Good Cause sign-in link',
    heading: 'Sign in to Good Cause',
    message: 'Someone tried to create a Good Cause account with this email address, which already has an account. Use the button below to sign in.\nIf this was not you, you can ignore this email.',
    cta: 'Sign in',
  },
  recovery: {
    subject: 'Reset your Good Cause password',
    heading: 'Reset your password',
    message: 'We received a request to reset the password for your Good Cause account. Use the button below to choose a new password. The link can only be used once.\nIf you did not ask for this, you can ignore this email and your password will not change.',
    cta: 'Choose a new password',
  },
};

export async function sendAuthEmail(to: string, type: AuthLinkType, link: string) {
  const c = COPY[type];
  return sendEmail({
    to,
    subject: c.subject,
    html: workflowEmailHtml({ heading: c.heading, message: c.message, ctaLabel: c.cta, ctaUrl: link }),
    text: `${c.message}\n\n${c.cta}: ${link}`,
  });
}
