'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Vault } from 'lucide-react';
import { testConnection } from '@/lib/vault/github';
import { useVault } from '@/components/layout/VaultGate';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/fields';
import SpotlightCard from '@/components/ui/SpotlightCard';
import Reveal from '@/components/layout/Reveal';
import { SectionTag } from '@/components/ui/typography';

export default function Login() {
  const { save } = useVault();
  const router = useRouter();
  const [owner, setOwner] = useState(process.env.NEXT_PUBLIC_VAULT_OWNER ?? 'elshawaf1');
  const [repo, setRepo] = useState(process.env.NEXT_PUBLIC_VAULT_REPO ?? 'MyVault');
  const [branch, setBranch] = useState(process.env.NEXT_PUBLIC_VAULT_BRANCH ?? 'main');
  const [token, setToken] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    if (!token.trim()) {
      setMsg('Paste a personal access token first.');
      return;
    }
    setBusy(true);
    const ctx = { owner: owner.trim(), repo: repo.trim(), branch: branch.trim() || 'main', token: token.trim() };
    const r = await testConnection(ctx);
    setBusy(false);
    if (!r.ok) {
      setMsg(`Connection failed — ${r.msg}`);
      return;
    }
    save(ctx);
    router.push('/app');
  };

  return (
    <div className="mx-auto max-w-xl px-5 py-16 md:py-24">
      <Reveal>
        <SectionTag index="00" label="RESTRICTED" />
        <h1 className="mb-3 text-5xl font-semibold tracking-tight"><span className="text-gradient">Vault login</span></h1>
        <p className="mb-8 text-ink-muted">Your notes live in a private repo. Unlock them with a GitHub token — it never leaves this browser.</p>
      </Reveal>
      <Reveal delay={100}>
        <SpotlightCard className="p-7">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <label className="text-sm text-ink-muted">Owner<Input value={owner} onChange={(e) => setOwner(e.target.value)} /></label>
              <label className="text-sm text-ink-muted">Repo<Input value={repo} onChange={(e) => setRepo(e.target.value)} /></label>
              <label className="text-sm text-ink-muted">Branch<Input value={branch} onChange={(e) => setBranch(e.target.value)} /></label>
            </div>
            <label className="text-sm text-ink-muted">
              Personal access token (classic, <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs">repo</code> scope)
              <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="ghp_… / github_pat_…" />
            </label>
            <Button variant="primary" onClick={connect} disabled={busy}>
              <KeyRound size={15} /> {busy ? 'Checking…' : 'Unlock vault'}
            </Button>
            {msg && <p className="text-sm text-ink-muted">{msg}</p>}
          </div>
        </SpotlightCard>
      </Reveal>
      <Reveal delay={160}>
        <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-sm leading-relaxed text-ink-muted">
          <div className="mb-2 flex items-center gap-2 font-medium text-ink"><Vault size={15} /> How to get a token</div>
          GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) →
          Generate new → scope <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs">repo</code> →
          paste it above. Use a fine-grained token limited to your vault repo for extra safety.
        </div>
      </Reveal>
    </div>
  );
}
