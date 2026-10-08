'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import ArticleCard from '@/components/blog/ArticleCard';
import Reveal from '@/components/layout/Reveal';
import { SectionTag } from '@/components/ui/typography';
import type { CardNote } from '@/lib/vault/types';

type Lite = CardNote;

export default function SearchPage({ notes }: { notes: Lite[] }) {
  const [q, setQ] = useState('');
  const needle = q.trim().toLowerCase();
  const results = needle
    ? notes
        .map((n) => {
          const hay = `${n.title} ${n.excerpt} ${n.tags.join(' ')}`.toLowerCase();
          let s = 0;
          if (n.title.toLowerCase().includes(needle)) s += 3;
          if (n.tags.some((t) => t.toLowerCase().includes(needle))) s += 2;
          if (hay.includes(needle)) s += 1;
          return { n, s };
        })
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.n)
    : [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-20">
      <Reveal>
        <SectionTag index="01" label="PUBLIC INDEX ONLY" />
        <h1 className="mb-8 text-5xl font-semibold tracking-tight md:text-6xl"><span className="text-gradient">Search</span></h1>
      </Reveal>
      <div className="relative mb-8">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle" />
        <input
          type="search"
          autoFocus
          placeholder="Search published stories… (private notes are never indexed)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search public stories"
          className="w-full rounded-xl border border-white/10 bg-base-input py-4 pl-12 pr-4 text-base text-gray-100 placeholder:text-gray-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all duration-200"
        />
      </div>
      {needle && (
        <>
          <p className="mb-6 font-mono text-xs tracking-widest text-ink-subtle">{results.length} RESULT{results.length === 1 ? '' : 'S'}</p>
          <div className="grid gap-5 md:grid-cols-2">
            {results.map((n) => (
              <ArticleCard key={n.slug} note={n} />
            ))}
          </div>
          {results.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">Nothing public matches “{q}”.</p>}
        </>
      )}
    </div>
  );
}
