import { listPublicNotes } from '@/lib/vault/content';
import { toCardNote } from '@/lib/vault/types';
import BlogFilter from '@/components/blog/BlogFilter';
import Reveal from '@/components/layout/Reveal';
import { SectionTag } from '@/components/ui/typography';

export default async function Blog() {
  const notes = await listPublicNotes();
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
      <Reveal>
        <SectionTag index="01" label="ARCHIVE" />
        <h1 className="mb-3 text-5xl font-semibold tracking-tight md:text-6xl"><span className="text-gradient">Stories</span></h1>
        <p className="mb-10 max-w-xl text-lg text-ink-muted">Published notes from the vault — essays, tutorials, and research writing.</p>
      </Reveal>
      <BlogFilter notes={notes.map(toCardNote)} />
    </div>
  );
}
