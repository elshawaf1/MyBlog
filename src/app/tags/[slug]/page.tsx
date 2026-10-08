import { notFound } from 'next/navigation';
import { listPublicNotes } from '@/lib/vault/content';
import { toCardNote } from '@/lib/vault/types';
import ArticleCard from '@/components/blog/ArticleCard';
import Reveal from '@/components/layout/Reveal';
import { SectionTag } from '@/components/ui/typography';

export async function generateStaticParams() {
  const notes = await listPublicNotes();
  return [...new Set(notes.flatMap((n) => n.tags))].map((tag) => ({ slug: tag }));
}

export default async function TagPage({ params }: { params: { slug: string } }) {
  const tag = decodeURIComponent(params.slug);
  const notes = (await listPublicNotes()).filter((n) => n.tags.includes(tag));
  if (notes.length === 0) return notFound();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <Reveal>
        <SectionTag index="01" label="TAG" />
        <h1 className="mb-3 text-5xl font-semibold tracking-tight md:text-6xl">
          <span className="text-accent-gradient">#{tag}</span>
        </h1>
        <p className="mb-10 font-mono text-xs tracking-widest text-ink-subtle">{notes.length} {notes.length === 1 ? 'STORY' : 'STORIES'}</p>
      </Reveal>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((n, i) => (
          <Reveal key={n.slug} delay={(i % 3) * 80}>
            <ArticleCard note={toCardNote(n)} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
