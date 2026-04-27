'use client';

import { useState, useRef } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

interface MusicFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
  initialData?: {
    title?: string;
    message?: string;
    audioUrl?: string;
    imageUrl?: string;
  };
}

export default function MusicForm({ onSubmit, loading, initialData }: MusicFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState(initialData?.message || '');
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', 'music');
    formData.append('title', title);
    formData.append('message', message);
    if (audioFile) formData.append('audio', audioFile);
    if (image) formData.append('image', image);
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <ImageUpload 
        label="Featured Image (for WhatsApp share)" 
        onImageSelect={setImage} 
        initialPreview={initialData?.imageUrl}
      />

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Soundtrack Title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Waheguru Simran — Live Recording"
          className="w-full rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder-zinc-600 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 transition"
        />
      </div>

      {/* Audio Upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Audio File {initialData?.audioUrl ? '(Change)' : <span className="text-red-400">*</span>}
        </label>
        <div
          onClick={() => fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${
            audioFile || initialData?.audioUrl
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
          }`}
        >
          {audioFile ? (
            <>
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm text-amber-400 font-medium truncate max-w-[200px]">{audioFile.name}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{(audioFile.size / 1024 / 1024).toFixed(2)} MB — click to change</p>
              </div>
            </>
          ) : initialData?.audioUrl ? (
            <>
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                 <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-300 font-medium">Existing audio track</p>
                <p className="text-xs text-zinc-500 mt-0.5">Click to replace with new file</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center">
                <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm text-zinc-400">Click to upload audio</p>
                <p className="text-xs text-zinc-600 mt-0.5">MP3, WAV, M4A, AAC supported</p>
              </div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="sr-only"
            required={!initialData?.audioUrl}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAudioFile(file);
            }}
          />
        </div>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Message
        </label>
        <RichTextEditor
          value={message}
          onChange={setMessage}
          placeholder="Describe the track, lyrics, or any context…"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || (!audioFile && !initialData?.audioUrl)}
        id="music-form-submit"
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 text-sm shadow-lg shadow-amber-900/30 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {initialData ? 'Saving...' : 'Uploading…'}
          </span>
        ) : (
          initialData ? 'Save Changes' : 'Add Music Card'
        )}
      </button>
    </form>
  );
}
