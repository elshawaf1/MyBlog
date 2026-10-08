'use client';

import { useState } from 'react';

export default function ShareRow({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const url = typeof window !== 'undefined' ? window.location.href : '';
  return (
    <div className="m-actions">
      <button onClick={copy}>{copied ? 'Copied ✓' : 'Copy link'}</button>
      <span>·</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener"
      >
        Post on X
      </a>
      <span>·</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener"
      >
        Share on LinkedIn
      </a>
    </div>
  );
}
