import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAllNotes, getPublicBySlug, relatedNotes } from '@/lib/vault/content';
import { toCardNote } from '@/lib/vault/types';
import { prettyName } from '@/lib/vault/names';
import { Badge } from '@/components/ui/typography';
import ShareButtons from '@/components/blog/ShareButtons';
import ArticleCard from '@/components/blog/ArticleCard';
import SpotlightCard from '@/components/ui/SpotlightCard';

export async function generateStaticParams() {
  const notes = await getAllNotes();
  return notes
    .filter((n) => n.status === 'published' && (n.visibility === 'public' || n.visibility === 'unlisted'))
    .map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const note = await getPublicBySlug(params.slug);
  if (!note) return { title: 'Not found' };
  return {
    title: note.title,
    description: note.excerpt,
    robots: note.visibility === 'public' && note.allowIndex ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function Article({ params }: { params: { slug: string } }) {
  const note = await getPublicBySlug(params.slug);
  if (!note) return notFound();
  const related = await relatedNotes(note);
  const backlinks = (note.backlinks ?? []).length
    ? (await getAllNotes()).filter((n) => note.backlinks?.includes(n.slug) && n.visibility === 'public' && n.status === 'published')
    : [];

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-20">
      <Link href="/blog" className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors">
        <ArrowLeft size={15} /> All stories
      </Link>
      <div className="mb-4 flex items-center gap-3 font-mono text-xs tracking-widest text-ink-subtle">
        <span className="text-accent">{prettyName(note.collection).toUpperCase()}</span>
        <span>·</span>
        <span>{note.publishedAt}</span>
        <span>·</span>
        <span>{note.readingMins} MIN READ</span>
        {note.visibility === 'unlisted' && <Badge tone="amber">UNLISTED</Badge>}
      </div>
      <h1 className="mb-4 text-4xl font-semibold leading-[1.1] tracking-[-0.02em] md:text-5xl">
        <span className="text-gradient">{note.title}</span>
      </h1>
      <p className="mb-8 text-lg leading-relaxed text-ink-muted md:text-xl">{note.excerpt}</p>
      <div className="mb-8">
        <ShareButtons title={note.title} />
      </div>
      {note.toc && note.toc.length > 1 && (
        <SpotlightCard spotlight={false} className="mb-10 p-6">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-ink-subtle">IN THIS STORY</div>
          <ul className="flex flex-col gap-1.5">
            {note.toc.map((t) => (
              <li key={t.id} className={t.level === 3 ? 'ml-4' : ''}>
                <a href={`#${t.id}`} className="text-sm text-ink-muted hover:text-ink transition-colors">{t.text}</a>
              </li>
            ))}
          </ul>
        </SpotlightCard>
      )}
      <div className="prose-vault" dangerouslySetInnerHTML={{ __html: note.html ?? '' }} />
      <div className="mt-10 flex flex-wrap gap-2">
        {note.tags.map((t) => (
          <Badge key={t} href={`/tags/${t}`}>{t}</Badge>
        ))}
      </div>
      {backlinks.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 font-mono text-xs tracking-widest text-ink-subtle">LINKED FROM</div>
          <div className="flex flex-col gap-2">
            {backlinks.map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} className="text-sm text-indigo-300 hover:text-ink transition-colors">
                → {b.title}
              </Link>
            ))}
          </div>
        </div>
      )}
      {related.length > 0 && (
        <div className="mt-16 border-t border-white/[0.06] pt-10">
          <div className="mb-6 font-mono text-xs tracking-widest text-ink-subtle">RELATED STORIES</div>
          <div className="grid gap-5 md:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.slug} note={toCardNote(r)} />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
