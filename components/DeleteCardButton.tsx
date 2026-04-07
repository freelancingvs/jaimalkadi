'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteCardButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => setConfirm(false), 3000);
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/cards/${slug}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`text-xs transition font-medium disabled:opacity-50 ${
        confirm
          ? 'text-red-400 hover:text-red-300 animate-pulse'
          : 'text-zinc-600 hover:text-red-400'
      }`}
      title={confirm ? 'Click again to confirm delete' : 'Delete card'}
    >
      {loading ? '…' : confirm ? 'Confirm?' : 'Delete'}
    </button>
  );
}
