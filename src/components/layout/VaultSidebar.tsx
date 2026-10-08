'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  NotebookPen,
  FolderKanban,
  Share2,
  Globe,
  Trash2,
  Image,
  Settings,
  ArrowLeft,
} from 'lucide-react';

const ITEMS = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/app/notes', label: 'All notes', icon: NotebookPen },
  { href: '/app/collections', label: 'Collections', icon: FolderKanban },
  { href: '/app/graph', label: 'Graph', icon: Share2 },
  { href: '/app/published', label: 'Published', icon: Globe },
  { href: '/app/media', label: 'Media', icon: Image },
  { href: '/app/trash', label: 'Trash', icon: Trash2 },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export default function VaultSidebar() {
  const path = usePathname();
  return (
    <aside className="w-full shrink-0 md:w-60">
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 md:sticky md:top-24">
        <div className="px-2 pb-2 font-mono text-[11px] tracking-widest text-ink-subtle">WORKSPACE</div>
        {ITEMS.map((it) => {
          const active = it.exact ? path === it.href : path?.startsWith(it.href);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                active ? 'bg-white/[0.07] text-ink' : 'text-ink-muted hover:bg-white/[0.04] hover:text-ink'
              }`}
            >
              <Icon size={16} className={active ? 'text-accent' : ''} />
              {it.label}
            </Link>
          );
        })}
        <Link
          href="/"
          className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-muted hover:bg-white/[0.04] hover:text-ink transition-all duration-200"
        >
          <ArrowLeft size={16} /> Back to site
        </Link>
      </div>
    </aside>
  );
}
