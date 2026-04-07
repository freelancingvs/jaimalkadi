'use client';

import { useState, useRef } from 'react';

interface ImageUploadProps {
  label: string;
  onImageSelect: (file: File | null) => void;
  aspectRatio?: string; // e.g. "1.91/1"
}

export default function ImageUpload({ label, onImageSelect, aspectRatio = '1.91/1' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setPreview(URL.createObjectURL(file));
      onImageSelect(file);
    } else {
      setPreview(null);
      onImageSelect(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">
        {label}
      </label>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative group cursor-pointer rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-amber-500/30 transition-all overflow-hidden"
        style={{ aspectRatio }}
      >
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-xs font-semibold">Change Image</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-400 text-xs font-medium">Click to upload featured image</p>
              <p className="text-zinc-600 text-[10px] mt-1">Recommended: 1200x630px (1.91:1)</p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
