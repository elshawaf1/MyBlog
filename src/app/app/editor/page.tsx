'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Save, Trash2, Globe, EyeOff, History } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import { deleteFile, getFile, putFile } from '@/lib/vault/github';
import { notePath, parseNoteFile, stringifyNoteFile } from '@/lib/vault/frontmatter';
import { effectiveAccess, validatePublish } from '@/lib/vault/publish';
import type { NoteMeta, NoteStatus, NoteVisibility } from '@/lib/vault/types';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import Button from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/fields';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Badge } from '@/components/ui/typography';

/** Lightweight client preview (full render happens at build). */
function preview(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/==(.+?)==/g, '<mark>$1</mark>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .split(/\n{2,}/).map((p) => (p.startsWith('<h') ? p : `<p>${p.replace(/\n/g, '<br/>')}</p>`)).join('');
}

function EditorInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { ctx } = useVault();
  const { notes, reload } = useVaultNotes();
  const id = params.get('id') ?? '';

  const [meta, setMeta] = useState<NoteMeta | null>(null);
  const [body, setBody] = useState('');
  const [sha, setSha] = useState<string | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ctx) return;
    (async () => {
      if (id === 'new') {
        const slug = params.get('slug') ?? 'untitled';
        const title = params.get('title') ?? 'Untitled';
        setMeta({ title, slug, status: 'draft', visibility: 'private', collection: 'inbox', tags: [], excerpt: '', publishedAt: '', allowIndex: true, pinned: false, path: notePath('inbox', slug), updatedAt: '' });
        setBody('');
        setSha(undefined);
        setLoaded(true);
        return;
      }
      try {
        const f = await getFile(ctx, id);
        if (!f) {
          setMsg('Note not found.');
          setLoaded(true);
          return;
        }
        const { meta: m, body: b } = parseNoteFile(f.text, id);
        setMeta(m);
        setBody(b);
        setSha(f.sha);
        setLoaded(true);
      } catch (e) {
        setMsg(`Load failed: ${String(e)}`);
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, id]);

  const save = useCallback(async (m: NoteMeta, b: string, s: string | undefined, silent: boolean) => {
    if (!ctx) return null;
    const url = await putFile(ctx, m.path, stringifyNoteFile(m, b), s, `${s ? 'Update' : 'Create'} ${m.slug} via vault`);
    const fresh = await getFile(ctx, m.path);
    return { url, sha: fresh?.sha };
  }, [ctx]);

  const saveNow = async () => {
    if (!meta || !ctx) return;
    setSaving(true);
    try {
      const r = await save(meta, body, sha, false);
      if (r?.sha) setSha(r.sha);
      setDirty(false);
      setMsg(`Saved. ${r?.url ? '' : ''}`);
      void reload();
    } catch (e) {
      setMsg(`Save failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  // autosave
  useEffect(() => {
    if (!loaded || !dirty || !meta || !ctx) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const r = await save(meta, body, sha, true);
        if (r?.sha) setSha(r.sha);
        setDirty(false);
      } catch {
        /* keep dirty; user can save manually */
      } finally {
        setSaving(false);
      }
    }, 2000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [body, meta, dirty, loaded, ctx, save, sha]);

  const takenSlugs = useMemo(() => notes.map((n) => n.slug), [notes]);
  const check = meta ? validatePublish(meta, takenSlugs, meta.path) : null;
  const backlinks = useMemo(() => {
    if (!meta) return [];
    const key = meta.slug.toLowerCase();
    return notes.filter((n) => n.path !== meta.path && new RegExp(`\\[\\[${key}(\\||\\]\\])`, 'i').test(n.body));
  }, [notes, meta]);

  const set = (patch: Partial<NoteMeta>) => {
    if (!meta) return;
    const next = { ...meta, ...patch };
    // keep path in sync with slug for renamed notes is intentionally NOT automatic
    setMeta(next);
    setDirty(true);
  };

  const publish = async () => {
    if (!meta || !check?.ok) return;
    const next: NoteMeta = { ...meta, status: 'published', publishedAt: meta.publishedAt || new Date().toISOString().slice(0, 10) };
    setMeta(next);
    setSaving(true);
    try {
      const r = await save(next, body, sha, false);
      if (r?.sha) setSha(r.sha);
      setDirty(false);
      setMsg('Published. The public site rebuilds from this note.');
      void reload();
    } catch (e) {
      setMsg(`Publish failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const unpublish = async () => {
    if (!meta) return;
    const next: NoteMeta = { ...meta, status: 'draft' };
    setMeta(next);
    setSaving(true);
    try {
      const r = await save(next, body, sha, false);
      if (r?.sha) setSha(r.sha);
      setDirty(false);
      setMsg('Unpublished — back to a private draft.');
      void reload();
    } catch (e) {
      setMsg(`Failed: ${String(e)}`);
    } finally {
      setSaving(false);
    }
  };

  const trash = async (permanent: boolean) => {
    if (!meta || !ctx) return;
    if (!confirm(permanent ? `Permanently delete ${meta.slug}? Cannot be undone.` : `Move ${meta.slug} to trash?`)) return;
    setSaving(true);
    try {
      if (permanent) {
        if (!sha) throw new Error('Missing sha');
        await deleteFile(ctx, meta.path, sha, `Delete ${meta.slug} via vault`);
        router.push('/app/trash');
      } else {
        const next = { ...meta, status: 'draft' as NoteStatus, };
        const trashed = { ...next, status: 'trashed' as NoteStatus };
        const r = await save(trashed, body, sha, false);
        setMeta(trashed);
        if (r?.sha) setSha(r.sha);
        setMsg('Moved to trash.');
        void reload();
      }
    } catch (e) {
      setMsg(`Failed: ${String(e)}`);
    } finally {
      setSaving(false);
      setDirty(false);
    }
  };

  if (!loaded) return <p className="py-16 text-center font-mono text-xs tracking-widest text-ink-subtle">LOADING NOTE…</p>;
  if (!meta) return <p className="py-16 text-center text-sm text-red-300">{msg || 'Note not found.'}</p>;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <div className="font-mono text-xs tracking-widest text-ink-subtle">EDITOR / {meta.slug.toUpperCase()}</div>
          <div className="mt-1 font-mono text-[11px] text-ink-subtle">
            {saving ? 'SAVING…' : dirty ? '● UNSAVED CHANGES (autosaves in 2s)' : '✓ ALL CHANGES SAVED'}
          </div>
        </div>
        <Button variant="primary" onClick={saveNow} disabled={saving || !dirty}>Save now</Button>
        <Button variant="danger" onClick={() => trash(meta.status === 'trashed')} disabled={saving}>
          <Trash2 size={15} /> {meta.status === 'trashed' ? 'Delete forever' : 'Trash'}
        </Button>
      </div>
      {msg && <p className="mb-4 text-sm text-ink-muted">{msg}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <input
            value={meta.title}
            onChange={(e) => { set(e.target.value ? { title: e.target.value } : { title: '' }); }}
            placeholder="Note title…"
            className="mb-4 w-full bg-transparent text-3xl font-semibold tracking-tight text-ink placeholder:text-gray-600 focus:outline-none md:text-4xl"
          />
          <MarkdownEditor
            value={body}
            onChange={(v) => { setBody(v); setDirty(true); }}
            previewHtml={preview}
          />
        </div>
        <div className="flex flex-col gap-5">
          <SpotlightCard spotlight={false} className="p-5">
            <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">PROPERTIES</div>
            <div className="flex flex-col gap-3 text-sm">
              <label className="text-ink-muted">Slug<Input value={meta.slug} onChange={(e) => set({ slug: e.target.value })} className="font-mono" /></label>
              <label className="text-ink-muted">Collection<Input value={meta.collection} onChange={(e) => set({ collection: e.target.value })} /></label>
              <label className="text-ink-muted">Tags (comma)<Input value={meta.tags.join(', ')} onChange={(e) => set({ tags: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} /></label>
              <label className="text-ink-muted">Excerpt<Input value={meta.excerpt} onChange={(e) => set({ excerpt: e.target.value })} /></label>
              <label className="flex items-center gap-2 text-ink-muted">
                <input type="checkbox" checked={meta.pinned} onChange={(e) => set({ pinned: e.target.checked })} className="accent-[#5E6AD2]" /> Pinned
              </label>
              <label className="flex items-center gap-2 text-ink-muted">
                <input type="checkbox" checked={meta.allowIndex} onChange={(e) => set({ allowIndex: e.target.checked })} className="accent-[#5E6AD2]" /> Allow search engines
              </label>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlight={false} className="p-5">
            <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">PUBLISHING</div>
            <div className="flex flex-col gap-3 text-sm">
              <label className="text-ink-muted">Status
                <Select value={meta.status} onChange={(e) => set({ status: e.target.value as NoteStatus })}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="trashed">Trashed</option>
                </Select>
              </label>
              <label className="text-ink-muted">Visibility
                <Select value={meta.visibility} onChange={(e) => set({ visibility: e.target.value as NoteVisibility })}>
                  <option value="private">Private — only you</option>
                  <option value="unlisted">Unlisted — secret link</option>
                  <option value="public">Public — listed on blog</option>
                </Select>
              </label>
              {check && check.errors.length > 0 && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  {check.errors.map((er) => <div key={er}>• {er}</div>)}
                </div>
              )}
              {check && check.warnings.length > 0 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                  {check.warnings.map((w) => <div key={w}>• {w}</div>)}
                </div>
              )}
              <div className="flex gap-2">
                {meta.status === 'published' ? (
                  <Button onClick={unpublish} disabled={saving}><EyeOff size={14} /> Unpublish</Button>
                ) : (
                  <Button variant="primary" onClick={publish} disabled={saving || !check?.ok}><Globe size={14} /> Publish</Button>
                )}
              </div>
              <div className="rounded-lg bg-white/[0.04] p-3 font-mono text-[11px] leading-relaxed text-ink-muted">
                ACCESS → {effectiveAccess(meta).toUpperCase()}
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard spotlight={false} className="p-5">
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-ink-subtle"><History size={12} /> BACKLINKS ({backlinks.length})</div>
            {backlinks.length === 0 && <p className="text-xs text-ink-muted">Nothing links here yet — orphans surface on the dashboard.</p>}
            {backlinks.map((b) => (
              <Link key={b.path} href={`/app/editor?id=${encodeURIComponent(b.path)}`} className="block rounded-lg px-2 py-1.5 text-sm text-indigo-300 hover:bg-white/[0.04] hover:text-ink transition-all">
                → {b.title}
              </Link>
            ))}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<p className="py-16 text-center font-mono text-xs tracking-widest text-ink-subtle">LOADING…</p>}>
      <EditorInner />
    </Suspense>
  );
}
