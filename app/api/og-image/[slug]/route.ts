import { NextRequest } from 'next/server';
import { getCard } from '@/lib/cards';

export const dynamic = 'force-dynamic';

function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // If URL contains localhost:3000, strip the origin to make it relative
  if (url.includes('localhost:3000')) {
    return url.replace(/^https?:\/\/localhost:3000/, '');
  }
  return url;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const card = await getCard(slug);

  // Determine base URL, favoring the production domain for reliability
  const host = request.headers.get('host') || '';
  let appUrl = 'https://www.sarabsanjhadarbar.com';
  
  if (host.includes('localhost')) {
    appUrl = `http://${host}`;
  } else if (host.includes('vercel.app')) {
    appUrl = `https://${host}`;
  } else if (host.includes('sarabsanjhadarbar.com')) {
    appUrl = host.includes('www.') ? 'https://www.sarabsanjhadarbar.com' : 'https://sarabsanjhadarbar.com';
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

  const imageUrl = sanitizeUrl(card.imageUrl);
  if (!imageUrl) return new Response('Not Found', { status: 404 });

  // Use Next.js Image Optimization internals for consistent sizing/compression
  // w=600 is perfect for a WhatsApp thumbnail and keeps file size very low
  const optimizedUrl = `${appUrl}/_next/image?url=${encodeURIComponent(imageUrl)}&w=640&q=60`;

  try {
    const response = await fetch(optimizedUrl, {
      headers: {
        'Accept': 'image/jpeg,image/png,image/*;q=0.8'
      }
    });
    
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
    
    return new Response(buffer, {
      headers: {
        'Content-Type': 'image/jpeg', // Force jpeg for maximum compatibility
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': buffer.byteLength.toString(),
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
