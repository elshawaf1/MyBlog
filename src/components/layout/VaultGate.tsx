'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { VaultCtx } from '@/lib/vault/github';

const KEY = 'vault-ctx';

interface Ctx {
  ctx: VaultCtx | null;
  save: (c: VaultCtx) => void;
  logout: () => void;
}

const VaultContext = createContext<Ctx>({ ctx: null, save: () => {}, logout: () => {} });

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [ctx, setCtx] = useState<VaultCtx | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setCtx(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  const save = (c: VaultCtx) => {
    localStorage.setItem(KEY, JSON.stringify(c));
    setCtx(c);
  };
  const logout = () => {
    localStorage.removeItem(KEY);
    setCtx(null);
  };

  return <VaultContext.Provider value={{ ctx, save, logout }}>{children}</VaultContext.Provider>;
}

export function useVault(): Ctx {
  return useContext(VaultContext);
}

/** Gate for /app/* pages: redirects to /login without a stored token. */
export function VaultGate({ children }: { children: React.ReactNode }) {
  const { ctx } = useVault();
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      if (!localStorage.getItem(KEY)) router.replace('/login');
      else setReady(true);
    }, 50);
    return () => clearTimeout(t);
  }, [router, ctx]);

  if (!ready && !ctx) {
    return <div className="py-24 text-center font-mono text-sm text-ink-muted">checking vault key…</div>;
  }
  return <>{children}</>;
}
