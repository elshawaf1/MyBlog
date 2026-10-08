'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Trash2, Pin } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import { putFile } from '@/lib/vault/github';
import { stringifyNoteFile } from '@/lib/vault/frontmatter';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/fields';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Badge } from '@/components/ui/typography';
import type { NoteStatus } from '@/lib/vault/types';

export default function Notes() {
  const { ctx } = useVault();
  const router = useRouter();
  const { notes, loading, error, reload } = useVaultNotes();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | NoteStatus>('all');
  const [sort, setSort] = useState<'path' | 'title'>('path');
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return notes
      .filter((n) => (status === 'all' ? true : n.status === status))
      .filter((n) =>
        needle
          ? `${n.title} ${n.body} ${n.tags.join(' ')} ${n.collection}`.toLowerCase().includes(needle)
          : true
      )
      .sort((a, b) => (sort === 'title' ? a.title.localeCompare(b.title) : b.path.localeCompare(a.path)));
  }, [notes, q, status, sort]);

  const toggle = (p: string) => {
    const next = new Set(sel);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setSel(next);
  };

  const bulkTrash = async () => {
    if (!ctx || sel.size === 0) return;
    if (!confirm(`Move ${sel.size} notes to trash?`)) return;
    setBusy(true);
    try {
      for (const p of sel) {
        const n = notes.find((x) => x.path === p);
        if (!n) continue;
        await putFile(ctx, p, stringifyNoteFile({ ...n, status: 'trashed' }, n.body), n.sha, `Trash ${n.slug} (bulk)`);
      }
      setSel(new Set());
      void reload();
    } finally {
      setBusy(false);
    }
  };

  const create = () => {
    const slug = newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!slug) return;
    router.push(`/app/editor?id=new&slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(newTitle.trim())}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 font-mono text-xs tracking-widest text-ink-subtle">WORKSPACE / NOTES</div>
          <h1 className="text-4xl font-semibold tracking-tight">All notes</h1>
        </div>
        <div className="flex gap-2">
          <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="New note title…" className="!w-52" />
          <Button variant="primary" onClick={create}><Plus size={15} /> New</Button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter notes…" className="!pl-10" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="!w-36">
          <option value="all">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
          <option value="trashed">Trashed</option>
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="!w-36">
          <option value="path">Newest file</option>
          <option value="title">Title A–Z</option>
        </Select>
        {sel.size > 0 && (
          <Button variant="danger" onClick={bulkTrash} disabled={busy}>
            <Trash2 size={15} /> Trash ({sel.size})
          </Button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {loading && <p className="font-mono text-xs tracking-widest text-ink-subtle">LOADING…</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((n) => (
          <SpotlightCard key={n.path} className="p-5">
            <div className="flex items-start gap-3">
              <input type="checkbox" checked={sel.has(n.path)} onChange={() => toggle(n.path)} className="mt-1.5 accent-[#5E6AD2]" aria-label={`Select ${n.title}`} />
              <div className="min-w-0 flex-1">
                <Link href={`/app/editor?id=${encodeURIComponent(n.path)}`} className="flex items-center gap-2 font-semibold tracking-tight hover:text-white">
                  {n.pinned && <Pin size={13} className="shrink-0 text-accent" />}
                  <span className="truncate">{n.title}</span>
                </Link>
                <div className="mt-1 font-mono text-[11px] text-ink-subtle">{n.collection} · {n.path}</div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Badge tone={n.status === 'published' ? 'green' : n.status === 'trashed' ? 'red' : 'default'}>{n.status}</Badge>
                  <Badge tone={n.visibility === 'public' ? 'accent' : n.visibility === 'unlisted' ? 'amber' : 'default'}>{n.visibility}</Badge>
                  {n.tags.slice(0, 3).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>
      {filtered.length === 0 && !loading && <p className="py-10 text-center text-sm text-ink-muted">No notes match.</p>}
    </div>
  );
}
