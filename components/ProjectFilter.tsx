'use client';

import { useMemo, useState } from 'react';

export type ProjectItem = {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  github: string;
  demo: string;
  contentHtml: string;
};

export default function ProjectFilter({ projects }: { projects: ProjectItem[] }) {
  const [q, setQ] = useState('');
  const [stack, setStack] = useState<string>('');

  const stacks = useMemo(() => [...new Set(projects.flatMap((p) => p.stack))].sort(), [projects]);

  const filtered = projects.filter((p) => {
    const hay = `${p.title} ${p.summary} ${p.stack.join(' ')}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (stack && !p.stack.includes(stack)) return false;
    return true;
  });

  return (
    <>
      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search projects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search projects"
        />
        <select value={stack} onChange={(e) => setStack(e.target.value)} aria-label="Filter by stack">
          <option value="">All stacks</option>
          {stacks.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <p><small className="muted">{filtered.length} of {projects.length} projects</small></p>
      {filtered.map((p) => (
        <div className="card" key={p.slug}>
          <h3>{p.title}</h3>
          <p><small className="muted">{p.summary}</small></p>
          <div className="meta">{p.stack.join(' · ')}</div>
          <small>
            {p.github && <a href={p.github}>GitHub</a>}
            {p.github && p.demo && ' · '}
            {p.demo && <a href={p.demo}>Demo</a>}
          </small>
          <div dangerouslySetInnerHTML={{ __html: p.contentHtml }} />
        </div>
      ))}
      {filtered.length === 0 && <p><small className="muted">No projects match.</small></p>}
    </>
  );
}
