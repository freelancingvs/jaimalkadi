import { NextRequest } from 'next/server';
import { getCard } from '@/lib/cards';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const card = await getCard(slug);

  // Determine base URL, favoring the production domain for reliability
  let appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.sarabsanjhadarbar.com').replace(/\/$/, '');
  if (appUrl.includes('vercel.app')) {
    appUrl = 'https://www.sarabsanjhadarbar.com';
  }

  // Fallback if no card or no user image
  if (!card || !card.imageUrl) {
    const defaultThumbnailResponse = await fetch(`${appUrl}/thumbnail.jpg`);
    if (!defaultThumbnailResponse.ok) return new Response('Not Found', { status: 404 });
    const defaultBuffer = await defaultThumbnailResponse.arrayBuffer();
    return new Response(defaultBuffer, { 
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600' } 
    });
  }

  // Use Next.js Image Optimization internals for consistent sizing/compression
  const optimizedUrl = `${appUrl}/_next/image?url=${encodeURIComponent(card.imageUrl)}&w=1200&q=75`;

  try {
    const response = await fetch(optimizedUrl);
    if (!response.ok) {
      // Fallback to raw image if optimization fails (e.g. domain not in next.config.ts)
      const rawResponse = await fetch(card.imageUrl);
      if (!rawResponse.ok) throw new Error('Raw image failed');
      const rawBuffer = await rawResponse.arrayBuffer();
      return new Response(rawBuffer, { 
        headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' } 
      });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/webp';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('OG Image Proxy Error:', err);
    // Ultimate fallback if everything fails
    const lastResort = await fetch(`${appUrl}/thumbnail.jpg`);
    const lastBuffer = await lastResort.arrayBuffer();
    return new Response(lastBuffer, { headers: { 'Content-Type': 'image/jpeg' } });
  }
}
