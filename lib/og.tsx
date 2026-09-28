import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

export function brandedOg({ eyebrow, title, footer }: { eyebrow: string; title: string; footer?: string }) {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#123b2d', color: '#fff', padding: '64px 72px', fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', fontSize: 30, letterSpacing: 4, textTransform: 'uppercase', color: '#b9e3c6' }}>Good Cause · {eyebrow}</div>
        <div style={{ display: 'flex', fontSize: title.length > 60 ? 58 : 70, fontWeight: 700, lineHeight: 1.1, maxWidth: 1050 }}>{title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#d7eadd' }}>
          <span>{footer || 'The cause receives 97.5% of every donation'}</span>
          <span>goodcause.webfitnews.co.nz</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
