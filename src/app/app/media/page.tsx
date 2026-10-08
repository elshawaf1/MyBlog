'use client';

import { useState } from 'react';
import { Upload, Copy, Check } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { b64FromBytes, getFile, listImages, putBinary } from '@/lib/vault/github';
import Button from '@/components/ui/Button';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function Media() {
  const { ctx } = useVault();
  const [files, setFiles] = useState<{ path: string }[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');

  const load = async () => {
    if (!ctx) return;
    setBusy(true);
    try {
      setFiles(await listImages(ctx));
      setLoaded(true);
    } catch (e) {
      setMsg(`Load failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const upload = async (f: File) => {
    if (!ctx) return;
    if (f.size > 5 * 1024 * 1024) {
      setMsg('File is over 5 MB.');
      return;
    }
    setBusy(true);
    try {
      const buf = await f.arrayBuffer();
      const name = f.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
      const path = `images/${Date.now()}-${name}`;
      await putBinary(ctx, path, b64FromBytes(buf), undefined, `Upload ${name} via vault`);
      setMsg(`Uploaded ${path}. It ships to the public site on next deploy.`);
      await load();
    } catch (e) {
      setMsg(`Upload failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const copyMd = async (name: string) => {
    const md = `![${name}](images/${name})`;
    try {
      await navigator.clipboard.writeText(md);
      setCopied(name);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-ink-subtle">WORKSPACE / MEDIA</div>
      <h1 className="mb-2 text-4xl font-semibold tracking-tight">Media</h1>
      <p className="mb-8 text-sm text-ink-muted">Attachments live in the vault repo (<code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs">images/</code>). Reference them as <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs">![](images/name.png)</code>.</p>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="primary" onClick={load} disabled={busy}><Upload size={15} /> {loaded ? 'Reload' : 'Load media'}</Button>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/[0.06] bg-surface px-4 py-2 text-sm transition-all hover:bg-surface-hover">
          <Upload size={15} /> Upload file (≤5 MB)
          <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); }} />
        </label>
      </div>
      {msg && <p className="mb-4 text-sm text-ink-muted">{msg}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {files.map((f) => {
          const name = f.path.replace(/^images\//, '');
          return (
            <SpotlightCard key={f.path} className="p-4">
              <div className="flex items-center gap-3">
                <code className="truncate font-mono text-xs text-ink-muted">{f.path}</code>
                <button
                  onClick={() => copyMd(name)}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-mono text-xs text-ink-muted hover:bg-white/[0.05] hover:text-ink transition-all"
                >
                  {copied === name ? <Check size={13} /> : <Copy size={13} />}
                  {copied === name ? 'Copied' : 'Copy MD'}
                </button>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
      {loaded && files.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No attachments yet.</p>}
    </div>
  );
}
