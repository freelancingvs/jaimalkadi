'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AdminBar from '@/components/AdminBar';

interface HeroSectionProps {
  loggedIn: boolean;
}

const BG = '#FEF9EE';

export default function HeroSection({ loggedIn }: HeroSectionProps) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const unmuteAttempted = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    const video = videoRef.current;

    // ── Check if mobile (matching Tailwind's sm breakpoint) ──
    const isMobile = () => window.innerWidth < 640;

    // ── Try playing audio with sound immediately (MOBILE ONLY) ──
    const tryUnmutedAudio = () => {
      if (!audio || !isMobile()) return;
      audio.muted = false;
      audio.play().then(() => {
        setMuted(false);
        unmuteAttempted.current = true;
      }).catch(() => {
        // Browser blocked — play muted, unmute on first interaction
        audio.muted = true;
        audio.play().catch(() => {});
      });
    };

    // ── Video (desktop only — ref will be null on mobile) ──
    if (video) {
      video.muted = false;
      video.play().then(() => {
        unmuteAttempted.current = true;
      }).catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    tryUnmutedAudio();

    // ── On first interaction unmute both audio and video ──
    const handleInteraction = () => {
      if (unmuteAttempted.current) return;
      unmuteAttempted.current = true;
      
      // Only unmute audio if on mobile
      if (audio && isMobile()) { 
        audio.muted = false; 
        audio.play().catch(() => {});
      }
      
      if (video) { video.muted = false; }
      setMuted(false);
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('scroll', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('scroll', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMuted = !muted;
    const isMobile = window.innerWidth < 640;

    if (videoRef.current) videoRef.current.muted = newMuted;
    
    // Only toggle audio if on mobile
    if (audioRef.current && isMobile) {
      audioRef.current.muted = newMuted;
    } else if (audioRef.current) {
      // Ensure audio is muted on desktop regardless of toggle (which controls video)
      audioRef.current.muted = true;
      audioRef.current.pause();
    }

    setMuted(newMuted);
    unmuteAttempted.current = true;
  };

  /* ── Shared bottom UI (store + social) ── */
  const BottomUI = ({ isMobile }: { isMobile: boolean }) => (
    <div style={{
      position: 'absolute',
      bottom: isMobile ? '1.75rem' : '2.5rem',
      left: 0, right: 0,
      zIndex: 10,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      padding: isMobile ? '0 1.5rem' : '0 2.25rem',
    }}>
      {/* LEFT: store */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.5rem' : '0.75rem' }}>
        <p style={{
          margin: 0,
          fontSize: isMobile ? '0.85rem' : '0.75rem',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.02em',
        }}>
          Official App
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link href={process.env.NEXT_PUBLIC_APP_STORE_URL || "https://apps.apple.com/us/app/sarab-sanjha-darbar/id6739017805"} target="_blank" rel="noopener noreferrer">
            <Image src="/apple.png" alt="App Store" width={isMobile ? 44 : 36} height={isMobile ? 44 : 36} style={{ display: 'block' }} />
          </Link>
          <Link href={process.env.NEXT_PUBLIC_PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=com.app.sarabsanjhadarbar"} target="_blank" rel="noopener noreferrer">
            <Image src="/playstore.png" alt="Google Play" width={isMobile ? 44 : 36} height={isMobile ? 44 : 36} style={{ display: 'block' }} />
          </Link>
        </div>
      </div>

      {/* RIGHT: social */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isMobile ? '0.9rem' : '0.85rem' }}>
        <Link href="https://www.youtube.com/@JaiMalkaDi" target="_blank" rel="noopener noreferrer">
          <Image src="/youtube.png" alt="YouTube" width={isMobile ? 30 : 26} height={isMobile ? 30 : 26} style={{ display: 'block', opacity: 0.9 }} />
        </Link>
        <Link href="https://www.facebook.com/JaiMalkaDi" target="_blank" rel="noopener noreferrer">
          <Image src="/facebook.png" alt="Facebook" width={isMobile ? 30 : 26} height={isMobile ? 30 : 26} style={{ display: 'block', opacity: 0.9 }} />
        </Link>
        <Link href="http://instagram.com/jaimalkadi" target="_blank" rel="noopener noreferrer">
          <Image src="/instagram.png" alt="Instagram" width={isMobile ? 30 : 26} height={isMobile ? 30 : 26} style={{ display: 'block', opacity: 0.9 }} />
        </Link>
      </div>
    </div>
  );

  return (
    <section style={{
      height: '100svh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: BG,
    }}>

      {/* Hidden background audio — Jai Malka Di */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src="/jai-malka-di.mp3"
        loop
        preload="auto"
        style={{ display: 'none' }}
      />

      {/* ════════════════════════════════════════════
          MOBILE LAYOUT  (hidden on sm+)
      ════════════════════════════════════════════ */}
      <div className="flex sm:hidden" style={{
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Image container with rounded bottom corners */}
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 32px 32px',
          background: BG,
        }}>
          {/* BG sky image — base layer */}
          <Image
            src="/BG.jpg"
            alt=""
            fill
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
            priority
          />

          {/* BG_Top figure + calligraphy — overlay (PNG with transparency) */}
          <Image
            src="/BG_Top.png"
            alt=""
            fill
            style={{ objectFit: 'contain', objectPosition: 'center bottom' }}
            priority
          />

          {/* Admin bar (logged-in only) */}
          {loggedIn && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
              <AdminBar loggedIn={loggedIn} />
            </div>
          )}

          {/* TOP: mobile_logo — contains logo + Sarab Sanjha Darbar + Kantian Sharif */}
          <div style={{
            position: 'absolute',
            top: '1.25rem',
            left: 0, right: 0,
            zIndex: 10,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Link href="https://www.sarabsanjhadarbar.com" target="_blank" rel="noopener noreferrer">
              <Image
                src="/mobile_logo.png"
                alt="Sarab Sanjha Darbar"
                width={236}
                height={126}
                style={{ objectFit: 'contain', display: 'block' }}
                priority
              />
            </Link>
          </div>

          {/* BOTTOM: store + social */}
          <BottomUI isMobile={true} />
        </div>
      </div>

      {/* ════════════════════════════════════════════
          DESKTOP LAYOUT  (hidden on mobile)
      ════════════════════════════════════════════ */}
      <div className="hidden sm:flex" style={{
        flex: 1,
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '0 0 32px 32px',
          background: BG,
        }}>
          {/* Full-bleed video */}
          <video
            ref={videoRef}
            src="/BG_Video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 35%',
              borderRadius: '0 0 24px 24px',
            }}
          />

          {/* TOP: Logo (left) + Title image (right) */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: '1.75rem 2rem',
          }}>
            <Link href="https://www.sarabsanjhadarbar.com" target="_blank" rel="noopener noreferrer">
              <Image
                src="/logo.png"
                alt="Sarab Sanjha Darbar Logo"
                width={56}
                height={56}
                style={{ borderRadius: '9999px', display: 'block' }}
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

          {/* Admin bar (logged-in only) */}
          {loggedIn && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
              <AdminBar loggedIn={loggedIn} />
            </div>
          )}

          {/* BOTTOM: store + social + mute */}
          <div style={{
            position: 'absolute',
            bottom: '2.5rem',
            left: 0, right: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            padding: '0 2.25rem',
          }}>
            {/* LEFT: download */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'rgba(255,255,255,0.85)',
                letterSpacing: '0.03em',
              }}>
                Download the official App
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link href={process.env.NEXT_PUBLIC_APP_STORE_URL || "https://apps.apple.com/us/app/sarab-sanjha-darbar/id6739017805"} target="_blank" rel="noopener noreferrer">
                  <Image src="/apple.png" alt="App Store" width={36} height={36} style={{ display: 'block' }} />
                </Link>
                <Link href={process.env.NEXT_PUBLIC_PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=com.app.sarabsanjhadarbar"} target="_blank" rel="noopener noreferrer">
                  <Image src="/playstore.png" alt="Google Play" width={36} height={36} style={{ display: 'block' }} />
                </Link>
              </div>
            </div>

            {/* RIGHT: social + mute */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
              <Link href="https://www.youtube.com/@JaiMalkaDi" target="_blank" rel="noopener noreferrer">
                <Image src="/youtube.png" alt="YouTube" width={26} height={26} style={{ display: 'block', opacity: 0.9 }} />
              </Link>
              <Link href="https://www.facebook.com/JaiMalkaDi" target="_blank" rel="noopener noreferrer">
                <Image src="/facebook.png" alt="Facebook" width={26} height={26} style={{ display: 'block', opacity: 0.9 }} />
              </Link>
              <Link href="http://instagram.com/jaimalkadi" target="_blank" rel="noopener noreferrer">
                <Image src="/instagram.png" alt="Instagram" width={26} height={26} style={{ display: 'block', opacity: 0.9 }} />
              </Link>
              <button
                onClick={toggleMute}
                aria-label={muted ? 'Unmute video' : 'Mute video'}
                style={{
                  marginTop: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2.1rem',
                  height: '2.1rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(255,255,255,0.25)',
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#fff',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {muted ? (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          COPYRIGHT STRIP — both breakpoints
      ════════════════════════════════════════════ */}
      <div style={{
        flexShrink: 0,
        height: '2.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: BG,
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#302306',
          letterSpacing: '0.04em',
        }}>
          © {new Date().getFullYear()} Sarab Sanjha Darbar
        </p>
      </div>
    </section>
  );
}
