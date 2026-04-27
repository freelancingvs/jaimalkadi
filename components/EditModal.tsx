'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/lib/types';
import EventForm from '@/components/forms/EventForm';
import MusicForm from '@/components/forms/MusicForm';
import PromotionForm from '@/components/forms/PromotionForm';

interface EditModalProps {
  card: Card;
  open: boolean;
  onClose: () => void;
}

export default function EditModal({ card, open, onClose }: EditModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setError('');
        setSuccess(false);
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
      const res = await fetch(`/api/cards/${card.slug}`, {
        method: 'PATCH',
        body: data,
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update card');
      setSuccess(true);
      router.refresh();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Edit card"
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
          <div>
            <h2 className="text-base font-semibold text-white">
              Edit {card.type.charAt(0).toUpperCase() + card.type.slice(1)} Card
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Update the details for this shareable link
            </p>
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
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">Changes Saved!</p>
                <p className="text-zinc-400 text-sm mt-1">Closing in a moment...</p>
              </div>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}
              {card.type === 'event' && (
                <EventForm 
                  onSubmit={handleSubmit} 
                  loading={loading} 
                  initialData={{
                    title: card.title,
                    location: card.location,
                    mapUrl: card.mapUrl,
                    message: card.message,
                    imageUrl: card.imageUrl,
                  }}
                />
              )}
              {card.type === 'music' && (
                <MusicForm 
                  onSubmit={handleSubmit} 
                  loading={loading} 
                  initialData={{
                    title: card.title,
                    message: card.message,
                    audioUrl: card.audioUrl,
                    imageUrl: card.imageUrl,
                  }}
                />
              )}
              {card.type === 'promotion' && (
                <PromotionForm 
                  onSubmit={handleSubmit} 
                  loading={loading} 
                  initialData={{
                    message: card.message,
                    imageUrl: card.imageUrl,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
