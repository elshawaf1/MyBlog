'use client';

import { useMemo, useState } from 'react';

export type PubItem = {
  title: string;
  venue: string;
  year: number;
  authors: string;
  link: string;
  pdf: string;
};

function bibtex(p: PubItem): string {
  const key = `${p.authors.split(' ')[0]}${p.year}${p.title.split(' ')[0]}`.replace(/[^A-Za-z0-9]/g, '');
  return `@misc{${key},\n  title = {${p.title}},\n  author = {${p.authors}},\n  year = {${p.year}},\n  howpublished = {${p.venue}},\n  url = {${p.link}}\n}`;
}

export default function PubFilter({ pubs }: { pubs: PubItem[] }) {
  const [q, setQ] = useState('');
  const [year, setYear] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);

  const years = useMemo(() => [...new Set(pubs.map((p) => p.year))].sort((a, b) => b - a), [pubs]);
  const venues = useMemo(() => [...new Set(pubs.map((p) => p.venue))].sort(), [pubs]);

  const filtered = pubs.filter((p) => {
    const hay = `${p.title} ${p.authors} ${p.venue}`.toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (year && p.year !== Number(year)) return false;
    if (venue && p.venue !== venue) return false;
    return true;
  });

  const copy = async (p: PubItem) => {
    try {
      await navigator.clipboard.writeText(bibtex(p));
      setCopied(p.title);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <>
      <div className="filter-bar">
        <input
          type="search"
          placeholder="Search papers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search publications"
        />
        <select value={year} onChange={(e) => setYear(e.target.value)} aria-label="Filter by year">
          <option value="">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <select value={venue} onChange={(e) => setVenue(e.target.value)} aria-label="Filter by venue">
          <option value="">All venues</option>
          {venues.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <p><small className="muted">{filtered.length} of {pubs.length} publications</small></p>
      {filtered.map((p) => (
        <div className="card" key={p.title}>
          <strong>{p.title}</strong>
          <div className="meta">{p.authors} · {p.venue} {p.year}</div>
          <small>
            <a href={p.link}>Link</a>
            {p.pdf ? <> · <a href={p.pdf}>PDF</a></> : null}
            {' · '}<button className="tag-chip" onClick={() => copy(p)}>
              {copied === p.title ? 'Copied!' : 'BibTeX'}
            </button>
          </small>
        </div>
      ))}
      {filtered.length === 0 && <p><small className="muted">No publications match.</small></p>}
    </>
  );
}
