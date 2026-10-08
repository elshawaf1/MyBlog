'use client';

import { useState } from 'react';
import { Link2, Check, Twitter, Linkedin } from 'lucide-react';

export default function ShareButtons({ title }: { title: string }) {
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
  const btn =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs text-ink-muted hover:bg-white/[0.05] hover:text-ink transition-all duration-200';

  return (
    <div className="flex items-center gap-1 border-y border-white/[0.06] py-3">
      <button onClick={copy} className={btn}>
        {copied ? <Check size={14} /> : <Link2 size={14} />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <a
        className={btn}
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener"
      >
        <Twitter size={14} /> Post
      </a>
      <a
        className={btn}
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener"
      >
        <Linkedin size={14} /> Share
      </a>
    </div>
  );
}
