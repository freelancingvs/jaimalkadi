'use client';

import { useState } from 'react';

export default function CopyAndShareCTA() {
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 5000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold py-4 px-6 text-base hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all shadow-xl shadow-amber-900/20 group"
      >
        <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        Copy and Share
      </button>

      {/* Snackbar */}
      <div 
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm transition-all duration-500 ${
          showSnackbar ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
      >
        <div className="bg-[#1a1a1a] border border-white/20 rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-white text-[15px] font-medium leading-relaxed">
              URL ਕਾਪੀ ਹੋ ਗਿਆ ਹੈ ਅਤੇ ਤੁਸੀਂ ਇਸਨੂੰ ਵਟਸਐਪ ਜਾਂ ਹੋਰ ਸੋਸ਼ਲ ਮੀਡੀਆ ਪਲੇਟਫਾਰਮਾਂ 'ਤੇ ਦੂਜਿਆਂ ਨਾਲ ਸਾਂਝਾ ਕਰ ਸਕਦੇ ਹੋ।
            </p>
            <div className="h-px w-full bg-white/10" />
            <p className="text-zinc-400 text-sm leading-relaxed">
              URL is copied and you can share it with others on WhatsApp or other social media platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
