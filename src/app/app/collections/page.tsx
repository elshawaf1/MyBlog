'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import { putFile } from '@/lib/vault/github';
import { stringifyNoteFile } from '@/lib/vault/frontmatter';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/fields';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function Collections() {
  const { ctx } = useVault();
  const { notes, loading, reload } = useVaultNotes();
  const [rename, setRename] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [newCol, setNewCol] = useState('');

  const live = useMemo(() => notes.filter((n) => n.status !== 'trashed'), [notes]);
  const cols = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of live) map.set(n.collection, (map.get(n.collection) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [live]);

  const doRename = async (from: string) => {
    const to = (rename[from] ?? '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (!ctx || !to || to === from) return;
    setBusy(true);
    try {
      const affected = live.filter((n) => n.collection === from);
      for (const n of affected) {
        const newPath = `notes/${to}/${n.slug}.md`;
        await putFile(ctx, newPath, stringifyNoteFile({ ...n, collection: to, path: newPath }, n.body), undefined, `Move ${n.slug} to ${to}`);
        const { deleteFile } = await import('@/lib/vault/github');
        await deleteFile(ctx, n.path, n.sha, `Remove old path ${n.slug}`);
      }
      setMsg(`Renamed “${from}” → “${to}” (${affected.length} notes moved).`);
      void reload();
    } catch (e) {
      setMsg(`Rename failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-ink-subtle">WORKSPACE / COLLECTIONS</div>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">Collections</h1>
      {msg && <p className="mb-4 text-sm text-ink-muted">{msg}</p>}
      {loading && <p className="font-mono text-xs tracking-widest text-ink-subtle">LOADING…</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {cols.map(([name, count]) => (
          <SpotlightCard key={name} className="p-5">
            <div className="flex items-center gap-3">
              <FolderKanban size={19} className="text-accent" />
              <Link href={`/app/notes`} className="text-lg font-semibold tracking-tight hover:text-white">{name}</Link>
              <span className="ml-auto rounded-full bg-white/[0.06] px-2.5 py-0.5 font-mono text-[11px]">{count}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Input value={rename[name] ?? ''} onChange={(e) => setRename({ ...rename, [name]: e.target.value })} placeholder={`Rename “${name}”…`} />
              <Button onClick={() => doRename(name)} disabled={busy}>Move</Button>
            </div>
          </SpotlightCard>
        ))}
      </div>
      <SpotlightCard spotlight={false} className="mt-6 p-5">
        <div className="mb-2 font-mono text-[11px] tracking-widest text-ink-subtle">NEW COLLECTION = FIRST NOTE IN IT</div>
        <div className="flex gap-2">
          <Input value={newCol} onChange={(e) => setNewCol(e.target.value)} placeholder="collection-name" />
          <Button
            variant="primary"
            onClick={() => {
              const c = newCol.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
              if (c) window.location.href = `/app/editor?id=new&slug=welcome-to-${c}&title=${encodeURIComponent('Welcome')}`;
            }}
          >
            Start it
          </Button>
        </div>
      </SpotlightCard>
    </div>
  );
}
