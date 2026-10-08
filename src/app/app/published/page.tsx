'use client';

import Link from 'next/link';
import { EyeOff } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import { putFile } from '@/lib/vault/github';
import { stringifyNoteFile } from '@/lib/vault/frontmatter';
import Button from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Badge } from '@/components/ui/typography';

export default function Published() {
  const { ctx } = useVault();
  const { notes, loading, reload } = useVaultNotes();
  const published = notes.filter((n) => n.status === 'published');

  const unpublish = async (path: string) => {
    if (!ctx) return;
    const n = notes.find((x) => x.path === path);
    if (!n) return;
    await putFile(ctx, path, stringifyNoteFile({ ...n, status: 'draft' }, n.body), n.sha, `Unpublish ${n.slug} via vault`);
    void reload();
  };

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-ink-subtle">WORKSPACE / PUBLISHED</div>
      <h1 className="mb-2 text-4xl font-semibold tracking-tight">Published</h1>
      <p className="mb-8 text-sm text-ink-muted">Every row below is (or will be, after deploy) on the public blog. Unpublish returns it to draft.</p>
      {loading && <p className="font-mono text-xs tracking-widest text-ink-subtle">LOADING…</p>}
      <div className="flex flex-col gap-3">
        {published.map((n) => (
          <SpotlightCard key={n.path} className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/app/editor?id=${encodeURIComponent(n.path)}`} className="font-semibold tracking-tight hover:text-white">
                {n.title}
              </Link>
              <Badge tone={n.visibility === 'public' ? 'accent' : 'amber'}>{n.visibility}</Badge>
              {!n.allowIndex && <Badge>NOINDEX</Badge>}
              <span className="ml-auto flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-subtle">{n.publishedAt || 'no date'}</span>
                <Button onClick={() => unpublish(n.path)}>
                  <EyeOff size={14} /> Unpublish
                </Button>
              </span>
            </div>
          </SpotlightCard>
        ))}
      </div>
      {published.length === 0 && !loading && <p className="py-10 text-center text-sm text-ink-muted">Nothing published yet.</p>}
    </div>
  );
}
