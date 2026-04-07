'use client';

import { useState } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-amber-500 hover:text-amber-400 transition font-medium"
      aria-label="Copy shareable link"
    >
      {copied ? '✓ Copied!' : 'Copy Link'}
    </button>
  );
}
