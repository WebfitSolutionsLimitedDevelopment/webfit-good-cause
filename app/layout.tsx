import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: { default: 'Good Cause | Community fundraising by Webfit News', template: '%s | Good Cause' },
  description: 'A transparent New Zealand community fundraising platform for verified people, communities and good causes.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://goodcause.webfitnews.co.nz')
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main>{children}</main><Footer /></body></html>;
}
