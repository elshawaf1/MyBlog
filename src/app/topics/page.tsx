import Link from 'next/link';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { collectionsWithCounts, listPublicNotes } from '@/lib/vault/content';
import Reveal from '@/components/layout/Reveal';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { SectionTag } from '@/components/ui/typography';

export default async function Topics() {
  const collections = await collectionsWithCounts();
  const notes = await listPublicNotes();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <Reveal>
        <SectionTag index="01" label="BROWSE" />
        <h1 className="mb-3 text-5xl font-semibold tracking-tight md:text-6xl"><span className="text-gradient">Topics</span></h1>
        <p className="mb-10 max-w-xl text-lg text-ink-muted">Vault collections with published stories — pick a shelf.</p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 3) * 80}>
            <Link href="/blog" className="block h-full">
              <SpotlightCard className="h-full p-7">
                <FolderKanban size={22} className="mb-4 text-accent" />
                <h2 className="mb-1 text-2xl font-semibold tracking-tight">{c.name}</h2>
                <p className="mb-4 font-mono text-xs tracking-widest text-ink-subtle">{c.count} {c.count === 1 ? 'STORY' : 'STORIES'}</p>
                <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted">Browse shelf <ArrowRight size={14} /></span>
              </SpotlightCard>
            </Link>
          </Reveal>
        ))}
      </div>
      {collections.length === 0 && <p className="text-sm text-ink-muted">No published topics yet.</p>}
    </div>
  );
}
