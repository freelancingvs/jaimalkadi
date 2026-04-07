'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <button
      id="sign-out-btn"
      onClick={handleSignOut}
      disabled={loading}
      className="text-sm text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-4 py-2 transition-all duration-150 disabled:opacity-50"
    >
      {loading ? 'Signing out…' : 'Sign Out'}
    </button>
  );
}
