import { getCard } from '@/lib/cards';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SmartCTA from '@/components/SmartCTA';
import CopyAndShareCTA from '@/components/CopyAndShareCTA';
import Link from 'next/link';
import Image from 'next/image';
import BackgroundAudio from '@/components/BackgroundAudio';

interface Props {
  params: Promise<{ slug: string }>;
}

function sanitizeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // If URL contains localhost:3000, strip the origin to make it relative
  // This fixes broken images when accessing from mobile/IP in dev
  if (url.includes('localhost:3000')) {
    return url.replace(/^https?:\/\/localhost:3000/, '');
  }
  return url;
}

// ── OG Meta Tags ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = await getCard(slug);

  if (!card) {
    return { title: 'Link not found — Sarab Sanjha Darbar' };
  }

  // 1. Same base URL logic as layout.tsx for absolute consistency
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.includes('vercel.app') 
    ? 'https://www.sarabsanjhadarbar.com' 
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://www.sarabsanjhadarbar.com');
  
  const appUrl = baseUrl.replace(/\/$/, '');
  const pageUrl = `${appUrl}/s/${slug}`;

  // 2. Clean Title & Description
  const title = card.title || 'Sarab Sanjha Darbar';
  let descriptionText = card.message
    ? card.message.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : 'Connecting the community through events, music and shared experiences.';

  if (card.type === 'event' && card.location) {
    descriptionText = `📍 Location: ${card.location} | ${descriptionText}`;
  }

  const cleanDescription = descriptionText.slice(0, 200).trim();
  const displayTitle = card.location ? `${title} — ${card.location}` : title;

  // 3. Use ABSOLUTE image path for maximum crawler compatibility
  // We point directly to the image file just like the homepage does with thumbnail.jpg
  let imageUrl = `${appUrl}/thumbnail.jpg`;
  if (card.imageUrl) {
    if (card.imageUrl.startsWith('http')) {
      imageUrl = card.imageUrl;
    } else {
      imageUrl = `${appUrl}${card.imageUrl.startsWith('/') ? '' : '/'}${card.imageUrl}`;
    }
  }

  return {
    title,
    description: cleanDescription,
    metadataBase: new URL(appUrl),
    alternates: {
      canonical: `/s/${slug}`,
    },
    openGraph: {
      title: displayTitle,
      description: cleanDescription,
      url: pageUrl,
      siteName: 'Sarab Sanjha Darbar',
      locale: 'en_US',
      type: 'website',
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl,
          width: 1200, 
          height: 630,
          alt: displayTitle,
          type: imageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: displayTitle,
      description: cleanDescription,
      images: [imageUrl],
    },
    other: {
      'image': imageUrl,
      'og:image:alt': displayTitle,
    },
  };
}

// ── Map embed helper ──────────────────────────────────────────────────────────

function getMapEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // Already an embed URL
    if (parsed.pathname.includes('/embed')) return url;
    // Regular Google Maps URL — add output=embed
    if (parsed.hostname.includes('google.com') && parsed.pathname.includes('/maps')) {
      parsed.searchParams.set('output', 'embed');
      return parsed.toString();
    }
  } catch {
    // Not a valid URL
  }
  return null;
}

// ── Shared page wrapper ───────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main 
      className="min-h-screen flex flex-col bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{ backgroundImage: 'url(/overall-bg.jpg)' }}
    >
      {/* Overlay to ensure contrast */}
      <div className="fixed inset-0 bg-black/40 -z-10" />

      {/* Background Audio */}
      <BackgroundAudio />

      {/* Header — matching HeroSection layout */}
      <header className="relative z-50 w-full">
        {/* Desktop Header: Logo Left, Text Right */}
        <div className="hidden sm:flex items-start justify-between px-8 py-7">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt="Sarab Sanjha Darbar Logo"
              width={56}
              height={56}
              className="rounded-full"
              priority
            />
          </Link>
          <Image
            src="/sarab-sanjha-darbar.png"
            alt="Sarab Sanjha Darbar"
            width={240}
            height={76}
            style={{ objectFit: 'contain', objectPosition: 'right top' }}
            priority
          />
        </div>

        {/* Mobile Header: Centered Logo */}
        <div className="flex sm:hidden justify-center pt-6 pb-2">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Image
              src="/mobile_logo.png"
              alt="Sarab Sanjha Darbar"
              width={236}
              height={126}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col relative z-10">{children}</div>
    </main>
  );
}

function CardContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 px-4 py-8 sm:px-6 sm:py-12 max-w-xl mx-auto w-full flex flex-col">
      <div className="bg-[#0d0d0d] backdrop-blur-2xl rounded-[2.5rem] border border-white/30 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] p-6 sm:p-10 flex flex-col gap-8">
        {children}
      </div>
    </div>
  );
}

// ── Type badge ────────────────────────────────────────────────────────────────

const TYPE_STYLES: Record<string, string> = {
  event: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  music: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  promotion: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
};

const TYPE_LABELS: Record<string, string> = {
  event: 'Event',
  music: 'Music',
  promotion: 'Promotion',
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SharePage({ params }: Props) {
  const { slug } = await params;
  const card = await getCard(slug);

  if (!card) notFound();

  const imageUrl = sanitizeUrl(card.imageUrl);
  const audioUrl = sanitizeUrl(card.audioUrl);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.includes('vercel.app') 
    ? 'https://www.sarabsanjhadarbar.com' 
    : (process.env.NEXT_PUBLIC_APP_URL || 'https://www.sarabsanjhadarbar.com');
  const appUrl = baseUrl.replace(/\/$/, '');
  const fullImageUrl = card.imageUrl 
    ? (card.imageUrl.startsWith('http') ? card.imageUrl : `${appUrl}${card.imageUrl.startsWith('/') ? '' : '/'}${card.imageUrl}`)
    : undefined;

  // ── EVENT PAGE ──────────────────────────────────────────────────────────────
  if (card.type === 'event') {
    const embedUrl = card.mapUrl ? getMapEmbedUrl(card.mapUrl) : null;

    return (
      <PageShell>
        <CardContainer>
          {/* Badge + Title */}
          <div className="flex flex-col gap-3">
            <span className={`self-start inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${TYPE_STYLES.event}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Event
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {card.title}
            </h1>
          </div>

          {/* Hero Image */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] aspect-video relative group">
              <img
                src={imageUrl}
                alt={card.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Location */}
          {card.location && (
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{card.location}</p>
                {card.mapUrl && (
                  <a
                    href={card.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-500 hover:text-amber-400 transition mt-0.5 inline-block"
                  >
                    Open in Maps ↗
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Map embed */}
          {embedUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/[0.07] aspect-video">
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Event location map"
                className="w-full h-full"
              />
            </div>
          )}

          {/* Rich text message */}
          {card.message && card.message !== '<p></p>' && (
            <div
              className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: card.message }}
            />
          )}

          {/* Copy and Share */}
          <CopyAndShareCTA title={card.title} location={card.location} imageUrl={fullImageUrl} />

          {/* Decorative divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

          {/* Smart CTA */}
          <SmartCTA eventType="event" />
        </CardContainer>
      </PageShell>
    );
  }

  // ── MUSIC PAGE ──────────────────────────────────────────────────────────────
  if (card.type === 'music') {
    return (
      <PageShell>
        <CardContainer>
          {/* Badge + Title */}
          <div className="flex flex-col gap-3">
            <span className={`self-start inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${TYPE_STYLES.music}`}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
              </svg>
              Music
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              {card.title}
            </h1>
          </div>

          {/* Hero Image */}
          {imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] aspect-video relative group">
              <img
                src={imageUrl}
                alt={card.title}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          )}

          {/* Audio player */}
          {audioUrl && (
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{card.title}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Preview track</p>
                </div>
              </div>
              {/* Native audio player */}
              <audio
                controls
                src={audioUrl}
                className="w-full rounded-lg"
                style={{ colorScheme: 'dark' }}
                preload="metadata"
              >
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {/* Rich text message */}
          {card.message && card.message !== '<p></p>' && (
            <div
              className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: card.message }}
            />
          )}

          {/* Copy and Share */}
          <CopyAndShareCTA title={card.title} imageUrl={fullImageUrl} />

          {/* Decorative divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          {/* Smart CTA */}
          <SmartCTA eventType="music" />
        </CardContainer>
      </PageShell>
    );
  }

  // ── PROMOTION PAGE ──────────────────────────────────────────────────────────
  return (
    <PageShell>
      <CardContainer>
        {/* Badge */}
        <div className="flex flex-col gap-3">
          <span className={`self-start inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${TYPE_STYLES.promotion}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.196-.138-.57-.334-1.12-.617a13.36 13.36 0 00-2.694-.963 9.75 9.75 0 01-1.02-3.91A3.75 3.75 0 0112 6.75a3.75 3.75 0 016.494 2.6 9.75 9.75 0 01-1.02 3.91 13.36 13.36 0 00-2.693.963c-.55.283-.924.479-1.12.617m-3.721 0c.36.255.738.48 1.13.672a3.75 3.75 0 003.181 0c.392-.192.77-.417 1.13-.672m-5.44 0l-.16.114a2.25 2.25 0 001.044 4.14l1.2-.172a2.25 2.25 0 001.918-2.225v-.078m-4.002-2.003a13.41 13.41 0 013.72 0" />
            </svg>
            Promotion
          </span>

          {/* Branded heading for promotions */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
            Sarab Sanjha Darbar
          </h1>
          <p className="text-zinc-400 text-sm">
            Connecting the community through events, music and shared experiences.
          </p>
        </div>

        {/* Hero Image */}
        {imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] aspect-video relative group">
            <img
              src={imageUrl}
              alt={card.title}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
        )}

        {/* Rich text message */}
        {card.message && card.message !== '<p></p>' && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div
              className="prose prose-invert prose-sm max-w-none text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: card.message }}
            />
          </div>
        )}

        {/* Copy and Share */}
        <CopyAndShareCTA title={card.title || "Promotion"} imageUrl={fullImageUrl} />

        {/* Decorative divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

        {/* Smart CTA */}
        <SmartCTA eventType="promotion" />
      </CardContainer>
    </PageShell>
  );
}
