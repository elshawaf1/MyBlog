'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface GNode {
  slug: string;
  title: string;
  orphans: boolean;
  collection: string;
}
export interface GEdge {
  from: string;
  to: string;
}

/** Dependency-free SVG knowledge graph (radial layout, click to open). */
export default function GraphView({ nodes, edges }: { nodes: GNode[]; edges: GEdge[] }) {
  const router = useRouter();
  const [focus, setFocus] = useState<string | null>(null);

  const layout = useMemo(() => {
    const W = 800;
    const H = 520;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) / 2 - 70;
    const pos = new Map<string, { x: number; y: number }>();
    nodes.forEach((n, i) => {
      const a = (2 * Math.PI * i) / Math.max(nodes.length, 1) - Math.PI / 2;
      pos.set(n.slug, { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) });
    });
    return { W, H, pos };
  }, [nodes]);

  const bySlug = useMemo(() => new Map(nodes.map((n) => [n.slug, n])), [nodes]);
  const visible = useMemo(() => {
    if (!focus) return { nodes, edges };
    const keep = new Set([focus]);
    for (const e of edges) {
      if (e.from === focus) keep.add(e.to);
      if (e.to === focus) keep.add(e.from);
    }
    return {
      nodes: nodes.filter((n) => keep.has(n.slug)),
      edges: edges.filter((e) => keep.has(e.from) && keep.has(e.to)),
    };
  }, [nodes, edges, focus]);

  return (
    <div>
      {focus && (
        <button
          onClick={() => setFocus(null)}
          className="mb-3 rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[11px] tracking-wide text-ink-muted hover:border-accent/50 hover:text-ink transition-all"
        >
          ✕ CLEAR FOCUS ({bySlug.get(focus)?.title})
        </button>
      )}
      <svg viewBox={`0 0 ${layout.W} ${layout.H}`} className="w-full rounded-2xl border border-white/[0.06] bg-white/[0.015]">
        {visible.edges.map((e, i) => {
          const a = layout.pos.get(e.from);
          const b = layout.pos.get(e.to);
          if (!a || !b) return null;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(94,106,210,0.35)" strokeWidth={1.2} />;
        })}
        {visible.nodes.map((n) => {
          const p = layout.pos.get(n.slug);
          if (!p) return null;
          const active = focus === n.slug;
          return (
            <g
              key={n.slug}
              transform={`translate(${p.x},${p.y})`}
              onClick={() => (active ? router.push(`/app/editor?id=${encodeURIComponent(`notes/${n.collection}/${n.slug}.md`)}`) : setFocus(n.slug))}
              style={{ cursor: 'pointer' }}
            >
              <circle r={active ? 10 : 7} fill={n.orphans ? 'rgba(255,255,255,0.15)' : '#5E6AD2'} opacity={active ? 1 : 0.85}>
                {active && <animate attributeName="r" values="10;13;10" dur="2s" repeatCount="indefinite" />}
              </circle>
              {active && <circle r={18} fill="none" stroke="rgba(94,106,210,0.4)" strokeWidth={1} />}
              <text y={22} textAnchor="middle" fill={active ? '#EDEDEF' : '#8A8F98'} fontSize={11} fontFamily="monospace">
                {n.title.length > 22 ? n.title.slice(0, 22) + '…' : n.title}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 font-mono text-[11px] tracking-widest text-ink-subtle">
        {nodes.length} NODES · {edges.length} EDGES · CLICK TO FOCUS, CLICK AGAIN TO OPEN · HOLLOW = ORPHAN
      </p>
    </div>
  );
}
