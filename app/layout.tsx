import type { Metadata } from 'next';
import './globals.css';
import './donor-feature.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { ORGANIZATION_JSONLD, SITE_URL, WEBSITE_JSONLD } from '@/lib/seo';

export const metadata: Metadata = {
  title: { default: 'Good Cause | Online fundraising in New Zealand', template: '%s | Good Cause NZ' },
  description: 'Start a fundraiser or donate to verified causes in New Zealand. Every campaign is reviewed, and the cause receives 97.5% of each donation.',
  metadataBase: new URL(SITE_URL),
  applicationName: 'Good Cause',
  authors: [{ name: 'Webfit Solutions Limited' }],
  publisher: 'Webfit Solutions Limited',
  category: 'fundraising',
  formatDetection: { telephone: false },
  openGraph: { siteName: 'Good Cause', locale: 'en_NZ', type: 'website' },
  twitter: { card: 'summary_large_image' },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-NZ"><body><JsonLd data={ORGANIZATION_JSONLD}/><JsonLd data={WEBSITE_JSONLD}/><Header /><main>{children}</main><Footer /></body></html>;
}
