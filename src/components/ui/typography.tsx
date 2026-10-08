import Link from 'next/link';

/** Mono uppercase section label, e.g. "01 — STORIES". */
export function SectionTag({ index, label }: { index: string; label: string }) {
  return (
    <div className="mb-4 flex items-center gap-3 font-mono text-xs tracking-widest text-ink-muted">
      <span className="text-accent">{index}</span>
      <span className="h-px w-8 bg-white/15" />
      <span>{label}</span>
    </div>
  );
}

/** Accent-outlined pill. */
export function Badge({
  children,
  href,
  tone = 'default',
}: {
  children: React.ReactNode;
  href?: string;
  tone?: 'default' | 'accent' | 'green' | 'red' | 'amber';
}) {
  const tones: Record<string, string> = {
    default: 'border-white/10 bg-white/[0.05] text-ink-muted',
    accent: 'border-accent/30 bg-accent/10 text-indigo-300',
    green: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    red: 'border-red-500/30 bg-red-500/10 text-red-300',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  };
  const cls = `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide ${tones[tone]}`;
  if (href) {
    return (
      <Link href={href} className={`${cls} transition-all duration-200 hover:border-accent/50 hover:text-ink`}>
        {children}
      </Link>
    );
  }
  return <span className={cls}>{children}</span>;
}
