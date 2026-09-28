import { SITE_URL } from './seo';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'd9055358b647b461301f9a2edf45a800';

/** Tell Bing and other IndexNow search engines that pages changed. Never throws. */
export async function pingIndexNow(paths: string[]) {
  if (!paths.length || !SITE_URL.startsWith('https://goodcause.')) return;
  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE_URL).host, key: INDEXNOW_KEY, keyLocation: `${SITE_URL}/indexnow-key.txt`, urlList: paths.map((p) => `${SITE_URL}${p}`) }),
    });
  } catch (error) {
    console.error('indexnow_ping_failed', String(error));
  }
}
