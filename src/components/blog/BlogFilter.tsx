'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import ArticleCard from './ArticleCard';
import type { CardNote } from '@/lib/vault/types';

export type { CardNote as BlogItem };

export default function BlogFilter({ notes }: { notes: CardNote[] }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => [...new Set(notes.flatMap((n) => n.tags))].sort(), [notes]);

  const filtered = notes.filter((n) => {
    const hay = `${n.title} ${n.excerpt} ${n.tags.join(' ')}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (tag && !n.tags.includes(tag)) return false;
    return true;
  });

  return (
    <>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search"
          placeholder="Search stories…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search articles"
          className="w-full rounded-lg border border-white/10 bg-base-input py-3 pl-11 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
        />
      </div>
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setTag(null)}
            className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-wide transition-all duration-200 ${
              tag === null ? 'border-accent bg-accent font-bold text-white' : 'border-white/10 text-ink-muted hover:border-accent/50 hover:text-ink'
            }`}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(tag === t ? null : t)}
              className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] tracking-wide transition-all duration-200 ${
                tag === t ? 'border-accent bg-accent font-bold text-white' : 'border-white/10 text-ink-muted hover:border-accent/50 hover:text-ink'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <p className="mb-6 font-mono text-xs tracking-widest text-ink-subtle">
        {filtered.length} OF {notes.length} STORIES
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((n) => (
          <ArticleCard key={n.slug} note={n} />
        ))}
      </div>
      {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No stories match.</p>}
    </>
  );
}
