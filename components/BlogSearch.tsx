'use client';

import { useMemo, useState } from 'react';
import PostRow, { RowPost } from '@/components/PostRow';

export type BlogItem = RowPost;

export default function BlogSearch({ posts }: { posts: BlogItem[] }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => [...new Set(posts.flatMap((p) => p.tags))].sort(), [posts]);

  const filtered = posts.filter((p) => {
    const hay = `${p.title} ${p.summary} ${p.tags.join(' ')}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (tag && !p.tags.includes(tag)) return false;
    return true;
  });

  return (
    <>
      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search stories…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search articles"
        />
      </div>
      {tags.length > 0 && (
        <div className="filter-bar">
          <button className={`tag-chip${tag === null ? ' active' : ''}`} onClick={() => setTag(null)}>
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              className={`tag-chip${tag === t ? ' active' : ''}`}
              onClick={() => setTag(tag === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}
      <p><small className="muted">{filtered.length} of {posts.length} stories</small></p>
      {filtered.map((p) => (
        <PostRow key={p.slug} p={p} />
      ))}
      {filtered.length === 0 && <p><small className="muted">No stories match.</small></p>}
    </>
  );
}
