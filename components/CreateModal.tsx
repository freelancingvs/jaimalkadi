'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CardType } from '@/lib/types';
import EventForm from '@/components/forms/EventForm';
import MusicForm from '@/components/forms/MusicForm';
import PromotionForm from '@/components/forms/PromotionForm';

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
}

const CARD_TYPES: {
  type: CardType;
  label: string;
  description: string;
  color: string;
  icon: React.ReactNode;
}[] = [
    {
      type: 'event',
      label: 'Event',
      description: 'Share an event with location, map & details',
      color: 'border-blue-500/30 hover:border-blue-400/50 hover:bg-blue-500/5',
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
        </svg>
      ),
    },
    {
      type: 'music',
      label: 'Music',
      description: 'Upload an audio track with a preview player',
      color: 'border-purple-500/30 hover:border-purple-400/50 hover:bg-purple-500/5',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      ),
    },
    {
      type: 'promotion',
      label: 'Promotion',
      description: 'Share a rich text message with a download CTA',
      color: 'border-amber-500/30 hover:border-amber-400/50 hover:bg-amber-500/5',
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.196-.138-.57-.334-1.12-.617a13.36 13.36 0 00-2.694-.963 9.75 9.75 0 01-1.02-3.91A3.75 3.75 0 0112 6.75a3.75 3.75 0 016.494 2.6 9.75 9.75 0 01-1.02 3.91 13.36 13.36 0 00-2.693.963c-.55.283-.924.479-1.12.617m-3.721 0c.36.255.738.48 1.13.672a3.75 3.75 0 003.181 0c.392-.192.77-.417 1.13-.672m-5.44 0l-.16.114a2.25 2.25 0 001.044 4.14l1.2-.172a2.25 2.25 0 001.918-2.225v-.078m-4.002-2.003a13.41 13.41 0 013.72 0" />
        </svg>
      ),
    },
  ];

export default function CreateModal({ open, onClose }: CreateModalProps) {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<CardType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSelectedType(null);
        setError('');
        setSuccess('');
      }, 300);
    }
  }, [open]);

  // ESC key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  async function handleSubmit(data: FormData) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        body: data,
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create card');
      const card = await res.json();
      setSuccess(`/s/${card.slug}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  let appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sarabsanjhadarbar.com';
  // If the env var is the old vercel one, override it for the user
  if (appUrl.includes('vercel.app')) {
    appUrl = 'https://www.sarabsanjhadarbar.com';
  }
  const selectedMeta = CARD_TYPES.find((c) => c.type === selectedType);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Create new card"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full sm:max-w-lg bg-[#141414] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl shadow-2xl shadow-black/60 flex flex-col max-h-[92dvh] sm:max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {selectedType && (
              <button
                onClick={() => { setSelectedType(null); setError(''); }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition"
                aria-label="Go back"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}
            <div>
              <h2 className="text-base font-semibold text-white">
                {selectedType ? `New ${selectedMeta?.label} Card` : 'Create a Card'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {selectedType ? selectedMeta?.description : 'Choose a card type to get started'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">

          {/* Success state */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Card Created!</p>
                <p className="text-zinc-400 text-sm mt-1">Your shareable link is ready</p>
              </div>
              <div className="w-full rounded-xl bg-white/[0.05] border border-white/[0.08] px-4 py-3 flex items-center gap-3">
                <code className="text-amber-400 text-sm flex-1 truncate">
                  {appUrl}{success}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${appUrl}${success}`)}
                  className="text-xs text-zinc-400 hover:text-white transition font-medium flex-shrink-0"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 text-sm active:scale-[0.98] transition"
              >
                Done
              </button>
            </div>
          ) : !selectedType ? (
            /* Type Selector */
            <div className="grid grid-cols-1 gap-3">
              {CARD_TYPES.map(({ type, label, description, color, icon }) => (
                <button
                  key={type}
                  id={`select-type-${type}`}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-4 w-full text-left rounded-xl border bg-white/[0.02] px-5 py-4 transition-all duration-150 active:scale-[0.98] ${color}`}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center">
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{description}</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            /* Form area */
            <div>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}
              {selectedType === 'event' && (
                <EventForm onSubmit={handleSubmit} loading={loading} />
              )}
              {selectedType === 'music' && (
                <MusicForm onSubmit={handleSubmit} loading={loading} />
              )}
              {selectedType === 'promotion' && (
                <PromotionForm onSubmit={handleSubmit} loading={loading} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
