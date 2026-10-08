import Link from 'next/link';
import type { CardNote } from '@/lib/vault/types';
import { prettyName } from '@/lib/vault/names';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Badge } from '@/components/ui/typography';

export default function ArticleCard({ note }: { note: CardNote }) {
  return (
    <Link href={`/blog/${note.slug}`} className="block h-full">
      <SpotlightCard className="h-full p-6">
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-ink-subtle">
          <span className="text-accent">{prettyName(note.collection).toUpperCase()}</span>
          <span>·</span>
          <span>{note.readingMins} MIN READ</span>
        </div>
        <h3 className="mb-2 text-xl font-semibold tracking-tight text-ink">{note.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-ink-muted">{note.excerpt}</p>
        <div className="flex flex-wrap items-center gap-2">
          {note.tags.slice(0, 3).map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
          <span className="ml-auto font-mono text-[11px] text-ink-subtle">{note.publishedAt}</span>
        </div>
      </SpotlightCard>
    </Link>
  );
}
