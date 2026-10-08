'use client';

import { useMemo } from 'react';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import GraphView from '@/components/graph/GraphView';

export default function Graph() {
  const { notes, loading } = useVaultNotes();

  const data = useMemo(() => {
    const live = notes.filter((n) => n.status !== 'trashed');
    const slugs = new Set(live.map((n) => n.slug.toLowerCase()));
    const edges: { from: string; to: string }[] = [];
    for (const n of live) {
      const refs = [...n.body.matchAll(/\[\[([^\]|]+)/g)].map((m) => m[1].trim().toLowerCase());
      const target = live.find((x) => x.slug.toLowerCase() === n.slug.toLowerCase());
      for (const r of refs) {
        const hit = live.find((x) => x.slug.toLowerCase() === r || x.title.toLowerCase() === r);
        if (hit && slugs.has(hit.slug.toLowerCase())) edges.push({ from: n.slug, to: hit.slug });
      }
      void target;
    }
    const linked = new Set([...edges.map((e) => e.from), ...edges.map((e) => e.to)]);
    return {
      nodes: live.map((n) => ({ slug: n.slug, title: n.title, orphans: !linked.has(n.slug), collection: n.collection })),
      edges,
    };
  }, [notes]);

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-ink-subtle">WORKSPACE / GRAPH</div>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">Knowledge graph</h1>
      {loading && <p className="font-mono text-xs tracking-widest text-ink-subtle">LOADING…</p>}
      {!loading && <GraphView nodes={data.nodes} edges={data.edges} />}
    </div>
  );
}
