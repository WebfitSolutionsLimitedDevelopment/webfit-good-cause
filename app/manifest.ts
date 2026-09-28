import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Good Cause – Online fundraising in New Zealand',
    short_name: 'Good Cause',
    description: 'Start a fundraiser or donate to verified causes in New Zealand.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#123b2d',
    lang: 'en-NZ',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  };
}
