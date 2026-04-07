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
  // Quality=65 is a good balance to ensure file stays under WhatsApp's ~300KB limit
  const optimizedUrl = `${appUrl}/_next/image?url=${encodeURIComponent(card.imageUrl)}&w=1200&q=65`;

  try {
    const response = await fetch(optimizedUrl);
    
    // If optimization fails (e.g. domain not in next.config.ts), we must ensure 
    // we don't serve a massive raw image (1MB+) as it won't show on WhatsApp.
    if (!response.ok) {
      console.warn('Next.js optimization failed, calling raw URL:', card.imageUrl);
      const rawResponse = await fetch(card.imageUrl);
      if (!rawResponse.ok) throw new Error('Raw image failed');
      const rawBuffer = await rawResponse.arrayBuffer();
      
      // If we are serving raw, we take it as-is but at least it matches. 
      // This is a last resort.
      return new Response(rawBuffer, { 
        headers: { 
          'Content-Type': 'image/jpeg', 
          'Cache-Control': 'public, max-age=3600' // Shorter cache for fallbacks
        } 
      });
    }

    const buffer = await response.arrayBuffer();
    // Default to image/jpeg for better crawler compatibility
    const contentType = response.headers.get('content-type') || 'image/jpeg';

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
