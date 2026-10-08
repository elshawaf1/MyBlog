'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Vault } from 'lucide-react';

const LINKS = [
  { href: '/blog', label: 'Stories' },
  { href: '/topics', label: 'Topics' },
  { href: '/search', label: 'Search' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-base/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-sm font-bold text-accent shadow-inner">
            A◆
          </span>
          <span className="font-semibold tracking-tight text-ink">Ahmed Yasser</span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3.5 py-2 text-sm transition-all duration-200 ${
                path?.startsWith(l.href) ? 'text-ink bg-white/[0.06]' : 'text-ink-muted hover:text-ink hover:bg-white/[0.05]'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-cta transition-all duration-200 hover:bg-accent-bright active:scale-[0.98]"
          >
            <Vault size={15} /> Open vault
          </Link>
        </nav>
        <button
          className="ml-auto rounded-lg p-2 text-ink-muted hover:bg-white/[0.05] hover:text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/[0.06] bg-base/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-ink-muted hover:bg-white/[0.05] hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-cta"
            >
              <Vault size={15} /> Open vault
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
