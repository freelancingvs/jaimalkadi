'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

interface EventFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  loading: boolean;
  initialData?: {
    title?: string;
    location?: string;
    mapUrl?: string;
    message?: string;
    imageUrl?: string;
  };
}

export default function EventForm({ onSubmit, loading, initialData }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [mapUrl, setMapUrl] = useState(initialData?.mapUrl || '');
  const [message, setMessage] = useState(initialData?.message || '');
  const [image, setImage] = useState<File | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', 'event');
    formData.append('title', title);
    formData.append('location', location);
    formData.append('mapUrl', mapUrl);
    formData.append('message', message);
    if (image) formData.append('image', image);
    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <ImageUpload 
        label="Featured Image (for WhatsApp share)" 
        onImageSelect={setImage} 
        initialPreview={initialData?.imageUrl}
      />

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Event Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Annual Kirtan Darbar 2026"
          className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-zinc-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition"
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Location <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Gurdwara Sri Guru Singh Sabha, Delhi"
          className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-zinc-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition"
        />
      </div>

      {/* Map URL */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Google Maps URL
        </label>
        <input
          type="url"
          value={mapUrl}
          onChange={(e) => setMapUrl(e.target.value)}
          placeholder="https://maps.google.com/…"
          className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-zinc-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition"
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Message
        </label>
        <RichTextEditor
          value={message}
          onChange={setMessage}
          placeholder="Add event details, schedule, dress code…"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        id="event-form-submit"
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 text-sm shadow-lg shadow-amber-900/30 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {initialData ? 'Saving...' : 'Creating…'}
          </span>
        ) : (
          initialData ? 'Save Changes' : 'Add Event Card'
        )}
      </button>
    </form>
  );
}
