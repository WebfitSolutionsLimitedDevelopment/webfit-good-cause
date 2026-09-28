import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
  ? process.env.NEXT_PUBLIC_SITE_URL
  : 'https://goodcause.webfitnews.co.nz').replace(/\/$/, '');

export const SITE_NAME = 'Good Cause';

export const CORE_KEYWORDS = [
  'fundraising NZ', 'online fundraising New Zealand', 'donate online NZ', 'fundraising page',
  'crowdfunding New Zealand', 'community fundraising', 'Auckland fundraising', 'start a fundraiser',
];

export function absoluteUrl(path = '/') {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

type PageMetaInput = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  noindex?: boolean;
  image?: string;
  type?: 'website' | 'article';
};

/** Consistent title, description, canonical, Open Graph and Twitter tags for a page. */
export function pageMeta({ path, title, description, keywords = [], noindex, image: imageInput, type = 'website' }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const image = imageInput || absoluteUrl('/opengraph-image');
  return {
    title,
    description,
    keywords: [...keywords, ...CORE_KEYWORDS].slice(0, 20),
    alternates: { canonical: url, languages: { 'en-NZ': url } },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: 'en_NZ',
      ...(image ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
    robots: noindex ? { index: false, follow: false, nocache: true } : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export const PRIVATE_META: Metadata = { robots: { index: false, follow: false, nocache: true } };

export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Good Cause',
  alternateName: 'Good Cause by Webfit News',
  url: SITE_URL,
  logo: absoluteUrl('/goodcause-logo.png'),
  description: 'New Zealand community fundraising platform operated by Webfit Solutions Limited. Every campaign is reviewed and the cause receives 97.5% of each donation.',
  areaServed: { '@type': 'Country', name: 'New Zealand' },
  parentOrganization: { '@type': 'Organization', name: 'Webfit Solutions Limited' },
};

export const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Good Cause',
  url: SITE_URL,
  inLanguage: 'en-NZ',
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
