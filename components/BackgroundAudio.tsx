'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Try playing unmuted
    audio.muted = false;
    audio.play().catch(() => {
      // If blocked by browser, wait for first interaction to play
      const handleInteraction = () => {
        audio.muted = false;
        audio.play().catch(() => {});
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('scroll', handleInteraction);
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      document.addEventListener('scroll', handleInteraction);
    });
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/bg-audio.mp3"
      loop
      preload="auto"
      className="hidden"
    />
  );
}
