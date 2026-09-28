import { brandedOg, OG_SIZE } from '@/lib/og';
export const alt = 'Good Cause – online fundraising in New Zealand';
export const size = OG_SIZE;
export const contentType = 'image/png';
export default function Image() {
  return brandedOg({ eyebrow: 'New Zealand', title: 'Start a fundraiser or donate to a verified cause' });
}
