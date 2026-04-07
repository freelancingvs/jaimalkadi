'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/RichTextEditor';
import ImageUpload from '@/components/ImageUpload';

interface PromotionFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

export default function PromotionForm({ onSubmit, loading }: PromotionFormProps) {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('type', 'promotion');
    formData.append('message', message);
    if (image) formData.append('image', image);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <ImageUpload label="Featured Image (for WhatsApp share)" onImageSelect={setImage} />
      
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 px-4 py-3">
        <p className="text-xs text-amber-400/80 leading-relaxed">
          Promotion cards show your formatted message with a <strong className="text-amber-400">Download the App</strong> CTA. Use the rich text editor to add links, bold text, and lists.
        </p>
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          Message <span className="text-red-400">*</span>
        </label>
        <RichTextEditor
          value={message}
          onChange={setMessage}
          placeholder="Write your promotion message here. You can use bold, links, and bullet points…"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        id="promotion-form-submit"
        className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-3 text-sm shadow-lg shadow-amber-900/30 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Creating…
          </span>
        ) : (
          'Add Promotion Card'
        )}
      </button>
    </form>
  );
}
