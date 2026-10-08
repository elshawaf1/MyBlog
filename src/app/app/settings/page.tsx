'use client';

import { useState } from 'react';
import { Download, LogOut, ShieldAlert } from 'lucide-react';
import { useVault } from '@/components/layout/VaultGate';
import { useVaultNotes } from '@/components/vault/useVaultNotes';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/fields';
import SpotlightCard from '@/components/ui/SpotlightCard';

export default function Settings() {
  const { ctx, logout } = useVault();
  const { notes } = useVaultNotes();
  const [profile, setProfile] = useState({ name: '', role: '', tagline: '', bio: '', email: '', github: '', scholar: '', linkedin: '' });
  const [loaded, setLoaded] = useState(false);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const loadProfile = async () => {
    if (!ctx) return;
    setBusy(true);
    try {
      // profile.json lives in the PUBLIC site repo (same token covers it)
      const r = await fetch(`https://api.github.com/repos/${ctx.owner}/MyBlog/contents/content/profile.json?ref=main`, {
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${ctx.token}` },
      });
      if (r.ok) {
        const j = await r.json();
        const text = decodeURIComponent(escape(atob((j.content as string).replace(/\n/g, ''))));
        setProfile(JSON.parse(text));
      }
      setLoaded(true);
    } catch (e) {
      setMsg(`Load failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async () => {
    if (!ctx) return;
    setBusy(true);
    try {
      const r = await fetch(`https://api.github.com/repos/${ctx.owner}/MyBlog/contents/content/profile.json?ref=main`, {
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${ctx.token}` },
      });
      const sha = r.ok ? ((await r.json()).sha as string) : undefined;
      const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(profile, null, 2) + '\n')));
      const body: Record<string, unknown> = { message: 'Update profile via vault settings', content: b64, branch: 'main' };
      if (sha) body.sha = sha;
      const put = await fetch(`https://api.github.com/repos/${ctx.owner}/MyBlog/contents/content/profile.json`, {
        method: 'PUT',
        headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!put.ok) throw new Error(`PUT profile: ${put.status}`);
      setMsg('Profile saved — public site rebuilds from it.');
    } catch (e) {
      setMsg(`Save failed: ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  const exportAll = () => {
    const data = notes.map((n) => ({ ...n, sha: undefined }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vault-export.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <div className="mb-2 font-mono text-xs tracking-widest text-ink-subtle">WORKSPACE / SETTINGS</div>
      <h1 className="mb-8 text-4xl font-semibold tracking-tight">Settings</h1>
      {msg && <p className="mb-4 text-sm text-ink-muted">{msg}</p>}

      <SpotlightCard spotlight={false} className="mb-5 p-6">
        <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">PUBLIC PROFILE (SHOWS ON THE SITE)</div>
        {!loaded ? (
          <Button onClick={loadProfile} disabled={busy}>Load profile</Button>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              {(Object.keys(profile) as (keyof typeof profile)[]).map((k) =>
                k === 'bio' || k === 'tagline' ? null : (
                  <label key={k} className="text-sm capitalize text-ink-muted">
                    {k}<Input value={profile[k]} onChange={(e) => setProfile({ ...profile, [k]: e.target.value })} />
                  </label>
                )
              )}
            </div>
            <label className="mt-3 block text-sm text-ink-muted">
              Tagline<Textarea value={profile.tagline} onChange={(e) => setProfile({ ...profile, tagline: e.target.value })} rows={2} />
            </label>
            <label className="mt-3 block text-sm text-ink-muted">
              Bio<Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={4} />
            </label>
            <Button variant="primary" onClick={saveProfile} disabled={busy} className="mt-4">Save profile</Button>
          </>
        )}
      </SpotlightCard>

      <SpotlightCard spotlight={false} className="mb-5 p-6">
        <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">DATA & PORTABILITY</div>
        <p className="mb-4 text-sm text-ink-muted">Notes are portable Markdown in your private repo — the ultimate backup. Export a JSON snapshot anytime.</p>
        <Button onClick={exportAll}><Download size={15} /> Export vault (JSON)</Button>
      </SpotlightCard>

      <SpotlightCard spotlight={false} className="mb-5 p-6">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-ink-subtle"><ShieldAlert size={13} /> SECURITY</div>
        <ul className="mb-4 list-disc pl-5 text-sm leading-relaxed text-ink-muted">
          <li>Token lives in this browser only (localStorage). Log out clears it.</li>
          <li>Use a fine-grained PAT limited to the vault repo (+ site repo for profile edits).</li>
          <li>Private means private: drafts never leave the private repo or the build machine.</li>
        </ul>
        <Button variant="danger" onClick={() => { logout(); window.location.href = '/login'; }}>
          <LogOut size={15} /> Log out of vault
        </Button>
      </SpotlightCard>
    </div>
  );
}
