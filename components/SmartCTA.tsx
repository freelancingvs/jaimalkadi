'use client';

import { useEffect, useState } from 'react';

interface SmartCTAProps {
  eventType: 'event' | 'music' | 'promotion';
}

const CTA_TEXT: Record<string, string> = {
  event: 'Download the App for Full Details',
  music: 'Download the App to Listen to the Full Track',
  promotion: 'Download the App',
};

type Platform = 'ios' | 'android' | 'desktop' | null;

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  return 'desktop';
}

export default function SmartCTA({ eventType }: SmartCTAProps) {
  const [platform, setPlatform] = useState<Platform>(null);
  const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL || 'https://apps.apple.com/us/app/sarab-sanjha-darbar/id6739017805';
  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.app.sarabsanjhadarbar';
  const ctaText = CTA_TEXT[eventType] || 'Download the App';

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  // Don't render until we know the platform (avoids layout shift)
  if (platform === null) {
    return (
      <div className="w-full h-14 rounded-2xl bg-white/[0.05] animate-pulse" />
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <p className="text-xs text-zinc-500 text-center uppercase tracking-widest font-medium">
        {ctaText}
      </p>

      {/* iOS only */}
      {platform === 'ios' && (
        <a
          href={appStoreUrl}
          id="cta-app-store"
          className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white text-black font-semibold py-4 px-6 text-sm active:scale-[0.98] transition-all shadow-lg shadow-black/30"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.22 1.3-2.2 3.88.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.64M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          App Store
        </a>
      )}

      {/* Android only */}
      {platform === 'android' && (
        <a
          href={playStoreUrl}
          id="cta-play-store"
          className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white text-black font-semibold py-4 px-6 text-sm active:scale-[0.98] transition-all shadow-lg shadow-black/30"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
          </svg>
          Google Play
        </a>
      )}

      {/* Desktop — show both */}
      {platform === 'desktop' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={appStoreUrl}
            id="cta-app-store-desktop"
            className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-white text-black font-semibold py-3.5 px-5 text-sm hover:bg-zinc-100 active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.15-2.22 1.3-2.2 3.88.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.64M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            App Store
          </a>
          <a
            href={playStoreUrl}
            id="cta-play-store-desktop"
            className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl border border-white/20 text-white font-semibold py-3.5 px-5 text-sm hover:bg-white/5 active:scale-[0.98] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
            </svg>
            Google Play
          </a>
        </div>
      )}
    </div>
  );
}
