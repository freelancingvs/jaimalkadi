'use client';

import { useState } from 'react';
import CreateModal from '@/components/CreateModal';

export default function CreateCardButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        id="create-card-btn"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-900/30 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all duration-150"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Create
      </button>

      <CreateModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
