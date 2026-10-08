import Link from 'next/link';
import { Github, Mail, GraduationCap, Linkedin, ArrowRight } from 'lucide-react';
import { getProfile } from '@/lib/site';
import { collectionsWithCounts, listPublicNotes } from '@/lib/vault/content';
import Reveal from '@/components/layout/Reveal';
import SpotlightCard from '@/components/ui/SpotlightCard';
import { SectionTag } from '@/components/ui/typography';

export default async function About() {
  const profile = getProfile();
  const notes = await listPublicNotes();
  const collections = await collectionsWithCounts();
  const initials = profile.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-20">
      <Reveal>
        <SectionTag index="01" label="THE HUMAN" />
        <div className="flex items-center gap-5">
          <span className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-b from-accent/40 to-accent/10 text-2xl font-bold text-white shadow-cta">
            {initials}
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl"><span className="text-gradient">{profile.name}</span></h1>
            <p className="mt-1 font-mono text-xs tracking-widest text-ink-subtle">{profile.role.toUpperCase()}</p>
          </div>
        </div>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-muted">{profile.bio}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-cta transition-all duration-200 hover:bg-accent-bright active:scale-[0.98]">
            <Mail size={15} /> Email me
          </a>
          <a href={profile.github} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-surface px-5 py-2.5 text-sm text-ink transition-all duration-200 hover:bg-surface-hover">
            <Github size={15} /> GitHub
          </a>
          <a href={profile.scholar} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-surface px-5 py-2.5 text-sm text-ink transition-all duration-200 hover:bg-surface-hover">
            <GraduationCap size={15} /> Scholar
          </a>
          <a href={profile.linkedin} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-surface px-5 py-2.5 text-sm text-ink transition-all duration-200 hover:bg-surface-hover">
            <Linkedin size={15} /> LinkedIn
          </a>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <SpotlightCard className="p-6">
            <div className="text-3xl font-semibold tracking-tight">{notes.length}</div>
            <div className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">PUBLISHED STORIES</div>
          </SpotlightCard>
          <SpotlightCard className="p-6">
            <div className="text-3xl font-semibold tracking-tight">{collections.length}</div>
            <div className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">TOPICS</div>
          </SpotlightCard>
          <SpotlightCard className="p-6">
            <div className="text-3xl font-semibold tracking-tight">{[...new Set(notes.flatMap((n) => n.tags))].length}</div>
            <div className="mt-1 font-mono text-[11px] tracking-widest text-ink-subtle">TAGS</div>
          </SpotlightCard>
        </div>
      </Reveal>
      <Reveal delay={150}>
        <div className="mt-10 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7">
          <h2 className="mb-2 text-xl font-semibold tracking-tight">How this site works</h2>
          <p className="text-sm leading-relaxed text-ink-muted">
            Everything I learn goes into a private vault. When a note is ready, I flip two flags
            and it appears here. <Link href="/blog" className="text-indigo-300 hover:text-ink transition-colors">Start reading <ArrowRight size={13} className="inline" /></Link>
          </p>
        </div>
      </Reveal>
    </div>
  );
}
