import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';

// Streams approved campaign images with cache headers (instead of redirecting to a
// short-lived signed URL), so browsers, the CDN and next/image can cache them.
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createServiceClient();
  const { data: item } = await db.from('campaign_media').select('storage_path,status,kind').eq('id', id).maybeSingle();
  if (!item || item.status !== 'approved' || item.kind !== 'image' || !item.storage_path) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { data, error } = await db.storage.from(process.env.SUPABASE_CAMPAIGN_MEDIA_BUCKET || 'campaign-media').download(item.storage_path);
  if (error || !data) return NextResponse.json({ error: 'Media unavailable' }, { status: 404 });
  return new Response(data, {
    headers: {
      'Content-Type': data.type || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
