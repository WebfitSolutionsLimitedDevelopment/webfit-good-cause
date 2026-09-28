export type Guide = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  keywords: string[];
  updated: string;
  intro: string;
  sections: { heading: string; body: string[]; list?: string[] }[];
  faqs: { q: string; a: string }[];
  related: string[];
};

export const GUIDES: Guide[] = [];

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug) || null;
}
