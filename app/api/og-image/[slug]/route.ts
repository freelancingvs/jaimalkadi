import { NextRequest } from 'next/server';
import { getCard } from '@/lib/cards';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const card = await getCard(slug);

  if (!card || !card.imageUrl) {
    return new Response('Not Found', { status: 404 });
  }

  // Fetch the optimized version from Vercel's image engine internals
  // We PROXY instead of REDIRECT because some crawlers (WhatsApp) don't follow redirects for images.
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://sarabsanjhadarbar.com').replace(/\/$/, '');
  const optimizedUrl = `${appUrl}/_next/image?url=${encodeURIComponent(card.imageUrl)}&w=1200&q=75`;

  const response = await fetch(optimizedUrl);
  if (!response.ok) {
    // Fallback to raw image if optimization fails
    const rawResponse = await fetch(card.imageUrl);
    if (!rawResponse.ok) return new Response('Not Found', { status: 404 });
    const rawBuffer = await rawResponse.arrayBuffer();
    return new Response(rawBuffer, { headers: { 'Content-Type': 'image/jpeg' } });
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/webp';

  return new Response(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
