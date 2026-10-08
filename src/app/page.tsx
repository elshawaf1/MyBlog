import Link from 'next/link';
import { ArrowRight, BookOpen, Network, PenLine } from 'lucide-react';
import { getProfile } from '@/lib/site';
import { collectionsWithCounts, listPublicNotes, tagsWithCounts } from '@/lib/vault/content';
import { toCardNote } from '@/lib/vault/types';
import Reveal from '@/components/layout/Reveal';
import HeroParallax from '@/components/layout/HeroParallax';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { Badge, SectionTag } from '@/components/ui/typography';
import ArticleCard from '@/components/blog/ArticleCard';

export default async function Home() {
  const profile = getProfile();
  const notes = await listPublicNotes();
  const featured = notes.filter((n) => n.pinned).concat(notes.filter((n) => !n.pinned)).slice(0, 3);
  const recent = notes.slice(0, 4);
  const collections = await collectionsWithCounts();
  const tags = (await tagsWithCounts()).slice(0, 8);

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-24 md:pb-28 md:pt-32">
        <HeroParallax>
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-xs tracking-widest text-indigo-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              PERSONAL KNOWLEDGE VAULT — NOW PUBLIC IN PARTS
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.05] tracking-[-0.03em] md:text-7xl">
              <span className="text-gradient">Your second brain,</span>
              <br />
              <span className="text-accent-gradient">published selectively.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl">
              {profile.tagline} I write notes on {profile.role.toLowerCase()} work in a private
              vault — the polished pieces surface here as stories.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white shadow-cta transition-all duration-200 hover:bg-accent-bright active:scale-[0.98]"
              >
                <BookOpen size={16} /> Read the stories
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-surface px-6 py-3 text-sm font-medium text-ink shadow-inner transition-all duration-200 hover:bg-surface-hover active:scale-[0.98]"
              >
                <PenLine size={16} /> Open my vault <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-12 flex gap-10 font-mono text-xs tracking-widest text-ink-subtle">
              <span><strong className="block text-2xl font-semibold tracking-tight text-ink">{notes.length}</strong>STORIES</span>
              <span><strong className="block text-2xl font-semibold tracking-tight text-ink">{collections.length}</strong>TOPICS</span>
              <span><strong className="block text-2xl font-semibold tracking-tight text-ink">{tags.length}+</strong>TAGS</span>
            </div>
          </Reveal>
        </HeroParallax>
      </section>

      {/* ---------- bento: how it works ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <SectionTag index="01" label="THE SYSTEM" />
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl">
            <span className="text-gradient">Write once. Organize privately.</span> Publish on purpose.
          </h2>
        </Reveal>
        <div className="mt-12 grid auto-rows-[180px] grid-cols-1 gap-5 md:grid-cols-6">
          <Reveal className="md:col-span-4 md:row-span-2" delay={0}>
            <SpotlightCard className="h-full p-8">
              <PenLine size={22} className="mb-4 text-accent" />
              <h3 className="mb-2 text-2xl font-semibold tracking-tight">Private vault</h3>
              <p className="max-w-md text-sm leading-relaxed text-ink-muted">
                Markdown notes, collections, tags, and <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs">[[internal links]]</code> —
                drafts, snippets, research, and half-formed ideas live here, invisible to the world.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge tone="accent">Markdown-first</Badge>
                <Badge>Autosave</Badge>
                <Badge>Backlinks</Badge>
                <Badge>Trash recovery</Badge>
              </div>
            </SpotlightCard>
          </Reveal>
          <Reveal className="md:col-span-2" delay={80}>
            <SpotlightCard className="h-full p-8">
              <BookOpen size={22} className="mb-4 text-accent" />
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Public blog</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Publishing flips two flags — nothing is ever copied. Private stays private by construction.
              </p>
            </SpotlightCard>
          </Reveal>
          <Reveal className="md:col-span-2" delay={160}>
            <SpotlightCard className="h-full p-8">
              <Network size={22} className="mb-4 text-accent" />
              <h3 className="mb-2 text-xl font-semibold tracking-tight">Knowledge graph</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                Every <code className="rounded bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs">[[link]]</code> becomes an edge. Orphans surface automatically.
              </p>
            </SpotlightCard>
          </Reveal>
        </div>
      </section>

      {/* ---------- featured ---------- */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <SectionTag index="02" label="FEATURED" />
            <div className="mb-10 flex items-end justify-between">
              <h2 className="text-4xl font-semibold tracking-tight md:text-5xl"><span className="text-gradient">Start here</span></h2>
              <Link href="/blog" className="hidden items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors md:inline-flex">
                All stories <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((n, i) => (
              <Reveal key={n.slug} delay={i * 80}>
                <ArticleCard note={toCardNote(n)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- recent + topics ---------- */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
            <div>
              <Reveal>
                <SectionTag index="03" label="FRESH INK" />
                <h2 className="mb-8 text-3xl font-semibold tracking-tight md:text-4xl">Recent stories</h2>
              </Reveal>
              <div className="flex flex-col gap-4">
                {recent.map((n, i) => (
                  <Reveal key={n.slug} delay={i * 60}>
                    <Link href={`/blog/${n.slug}`} className="group flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.04] hover:-translate-y-0.5">
                      <div>
                        <div className="mb-1 font-mono text-[11px] tracking-widest text-ink-subtle">{n.publishedAt} · {n.readingMins} MIN</div>
                        <div className="font-semibold tracking-tight group-hover:text-white">{n.title}</div>
                      </div>
                      <ArrowRight size={17} className="shrink-0 text-ink-subtle transition-all duration-200 group-hover:translate-x-1 group-hover:text-accent" />
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <Reveal delay={100}>
                <SectionTag index="04" label="TOPICS" />
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                  <div className="flex flex-col gap-1">
                    {collections.map((c) => (
                      <Link key={c.slug} href={`/topics`} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-ink-muted hover:bg-white/[0.04] hover:text-ink transition-all duration-200">
                        {c.name}
                        <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 font-mono text-[11px]">{c.count}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-white/[0.06] pt-5">
                    {tags.map((t) => (
                      <Badge key={t.tag} href={`/tags/${t.tag}`}>{t.tag}</Badge>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
