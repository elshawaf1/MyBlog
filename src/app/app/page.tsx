'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, Pin } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import { putFile } from '@/lib/vault/github';
import { notePath, stringifyNoteFile } from '@/lib/vault/frontmatter';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/fields';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Badge, SectionTag } from '@/components/ui/typography';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { ctx } = useVault();
  const { notes, loading, error, reload } = useVaultNotes();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const live = notes.filter((n) => n.status !== 'trashed');
  const published = live.filter((n) => n.status === 'published');
  const linked = new Set(live.flatMap((n) => [...(n.body.match(/\[\[([^\]|]+)/g) ?? []).map((m) => m.slice(2).trim().toLowerCase())]));
  const orphans = live.filter((n) => ![...linked].some((l) => n.slug.toLowerCase() === l || n.title.toLowerCase() === l));
  const recent = [...live].slice(0, 5);
  const pinned = live.filter((n) => n.pinned);

  const capture = async () => {
    if (!ctx || !title.trim()) {
      setMsg('Give the note a title first.');
      return;
    }
    setSaving(true);
    try {
      const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const path = notePath('inbox', slug);
      await putFile(
        ctx,
        path,
        stringifyNoteFile(
          { title: title.trim(), slug, status: 'draft', visibility: 'private', collection: 'inbox', tags: [], excerpt: '', publishedAt: '', allowIndex: true, pinned: false, path, updatedAt: '' },
          body
        ),
        undefined,
        `Capture note: ${slug}`
      );
      setTitle('');
      setBody('');
      setMsg('Captured as a private draft.');
      void reload();
    } catch (e) {
      setMsg(`Capture failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionTag index="00" label="MY VAULT" />
      <h1 className="mb-1 text-4xl font-semibold tracking-tight md:text-5xl"><span className="text-gradient">{greeting()}</span></h1>
      <p className="mb-8 text-ink-muted">Your ideas, all in one place.</p>
      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
      {loading && <p className="mb-4 font-mono text-xs tracking-widest text-ink-subtle">LOADING VAULT…</p>}

      <div className="grid gap-5 md:grid-cols-3">
        <SpotlightCard className="p-6">
          <div className="text-3xl font-semibold tracking-tight">{live.length}</div>
          <div className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">NOTES</div>
        </SpotlightCard>
        <SpotlightCard className="p-6">
          <div className="text-3xl font-semibold tracking-tight">{published.length}</div>
          <div className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">PUBLISHED</div>
        </SpotlightCard>
        <SpotlightCard className="p-6">
          <div className="text-3xl font-semibold tracking-tight">{orphans.length}</div>
          <div className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">ORPHANS (NO LINKS)</div>
        </SpotlightCard>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SpotlightCard className="p-6">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">QUICK CAPTURE → PRIVATE DRAFT</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title…" className="mb-3" />
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Capture the thought…" rows={4} className="mb-3 font-mono" />
          <Button variant="primary" onClick={capture} disabled={saving}>
            <Plus size={15} /> {saving ? 'Saving…' : 'Capture note'}
          </Button>
          {msg && <p className="mt-3 text-sm text-ink-muted">{msg}</p>}
        </SpotlightCard>
        <SpotlightCard className="p-6">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">RECENTLY TOUCHED</div>
          <div className="flex flex-col gap-1">
            {recent.map((n) => (
              <Link key={n.path} href={`/app/editor?id=${encodeURIComponent(n.path)}`} className="rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-white/[0.04]">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {n.pinned && <Pin size={13} className="text-accent" />}
                  {n.title}
                </div>
                <div className="mt-0.5 font-mono text-[11px] text-ink-subtle">{n.collection} · {n.status} · {n.visibility}</div>
              </Link>
            ))}
            {recent.length === 0 && !loading && <p className="text-sm text-ink-muted">No notes yet — capture one.</p>}
          </div>
          <Link href="/app/notes" className="mt-3 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
            All notes <ArrowRight size={14} />
          </Link>
        </SpotlightCard>
      </div>

      {pinned.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">PINNED</div>
          <div className="flex flex-wrap gap-2">
            {pinned.map((n) => (
              <Link key={n.path} href={`/app/editor?id=${encodeURIComponent(n.path)}`}>
                <Badge tone="accent">{n.title}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
