'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import { deleteFile, putFile } from '@/lib/vault/github';
import { stringifyNoteFile } from '@/lib/vault/frontmatter';
import Button from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function Trash() {
  const { ctx } = useVault();
  const { notes, loading, reload } = useVaultNotes();
  const [busy, setBusy] = useState(false);
  const trashed = notes.filter((n) => n.status === 'trashed');

  const restore = async (path: string) => {
    if (!ctx) return;
    const n = notes.find((x) => x.path === path);
    if (!n) return;
    setBusy(true);
    try {
      await putFile(ctx, path, stringifyNoteFile({ ...n, status: 'draft' }, n.body), n.sha, `Restore ${n.slug} via vault`);
      void reload();
    } finally {
      setBusy(false);
    }
  };

  const destroy = async (path: string, sha: string) => {
    if (!ctx) return;
    if (!confirm('Permanently delete? Cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteFile(ctx, path, sha, `Permanently delete ${path} via vault`);
      void reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-ink-subtle">WORKSPACE / TRASH</div>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">Trash</h1>
      {loading && <p className="font-mono text-xs tracking-widest text-ink-subtle">LOADING…</p>}
      <div className="flex flex-col gap-3">
        {trashed.map((n) => (
          <SpotlightCard key={n.path} className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold tracking-tight text-ink-muted">{n.title}</span>
              <span className="font-mono text-[11px] text-ink-subtle">{n.path}</span>
              <span className="ml-auto flex gap-2">
                <Button onClick={() => restore(n.path)} disabled={busy}>
                  <RotateCcw size={14} /> Restore
                </Button>
                <Button variant="danger" onClick={() => destroy(n.path, n.sha)} disabled={busy}>
                  <Trash2 size={14} /> Delete forever
                </Button>
              </span>
            </div>
          </SpotlightCard>
        ))}
      </div>
      {trashed.length === 0 && !loading && <p className="py-10 text-center text-sm text-ink-muted">Trash is empty. Deleted notes can be recovered here.</p>}
      <p className="mt-6 text-sm text-ink-muted">
        Looking for a trashed published article? <Link href="/app/published" className="text-indigo-300 hover:text-ink">Check Published</Link> — trashing unpublishes it on next deploy.
      </p>
    </div>
  );
}
