import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-base-deep">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-sm font-bold text-accent">
                A◆
              </span>
              <span className="font-semibold tracking-tight">Ahmed Yasser</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
              A personal knowledge vault with a public face — notes on AI, algorithms, and building.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-16 gap-y-2.5 text-sm">
            <Link href="/blog" className="text-ink-muted hover:text-ink transition-colors">Stories</Link>
            <Link href="/topics" className="text-ink-muted hover:text-ink transition-colors">Topics</Link>
            <Link href="/search" className="text-ink-muted hover:text-ink transition-colors">Search</Link>
            <Link href="/about" className="text-ink-muted hover:text-ink transition-colors">About</Link>
            <Link href="/rss.xml" className="text-ink-muted hover:text-ink transition-colors">RSS</Link>
            <Link href="/login" className="text-ink-muted hover:text-ink transition-colors">Vault login</Link>
          </nav>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-white/[0.06] pt-6 font-mono text-xs text-ink-subtle">
          <span>© {new Date().getFullYear()} Ahmed Yasser</span>
          <span>vault → blog · write once, publish selectively</span>
        </div>
      </div>
    </footer>
  );
}
