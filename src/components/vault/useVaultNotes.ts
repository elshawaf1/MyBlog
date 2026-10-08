'use client';

import { useCallback, useEffect, useState } from 'react';
import { useVault } from '@/components/layout/VaultGate';
import { getFile, listNoteFiles } from '@/lib/vault/github';
import { parseNoteFile } from '@/lib/vault/frontmatter';
import type { Note } from '@/lib/vault/types';

export interface VaultNote extends Note {
  sha: string;
}

/** Loads all vault notes through the GitHub API (token-gated). */
export function useVaultNotes() {
  const { ctx } = useVault();
  const [notes, setNotes] = useState<VaultNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    if (!ctx) return;
    setLoading(true);
    setError('');
    try {
      const entries = await listNoteFiles(ctx);
      const out: VaultNote[] = [];
      for (const e of entries) {
        const f = await getFile(ctx, e.path);
        if (!f) continue;
        const { meta, body } = parseNoteFile(f.text, e.path);
        const words = body.split(/\s+/).filter(Boolean).length;
        out.push({ ...meta, body, sha: f.sha, readingMins: Math.max(1, Math.round(words / 200)) });
      }
      out.sort((a, b) => b.path.localeCompare(a.path));
      setNotes(out);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [ctx]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { notes, loading, error, reload, setNotes };
}
