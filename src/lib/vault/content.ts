import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import { parseNoteFile } from './frontmatter';
import { prettyName } from './names';
import { isPublicNote, isReachableNote } from './types';
import type { Collection, GraphData, Note } from './types';

const ROOT = process.cwd();

/** Build-time content source: CI vault checkout > env dir > bundled seed. */
export function contentRoot(): string {
  const candidates = [
    path.join(ROOT, 'vault-content'),
    process.env.VAULT_CONTENT_DIR
      ? path.resolve(ROOT, process.env.VAULT_CONTENT_DIR)
      : null,
    path.join(ROOT, 'content', 'seed'),
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, 'notes'))) return c;
  }
  return path.join(ROOT, 'content', 'seed');
}

function walkMd(dir: string, base: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(full, base));
    else if (e.name.endsWith('.md')) out.push(path.relative(base, full).replace(/\\/g, '/'));
  }
  return out;
}

function slugifyText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** [[slug]] and [[slug|Label]] → markdown links (resolved) or bold fallback. */
function resolveWikiLinks(body: string, bySlug: Map<string, Note>): string {
  return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, ref: string, label?: string) => {
    const key = ref.trim().toLowerCase();
    const target = bySlug.get(key);
    const text = (label ?? target?.title ?? ref).trim();
    if (target) return `[${text}](/blog/${target.slug})`;
    return `**${text}**`;
  });
}

function extractToc(md: string): NonNullable<Note['toc']> {
  const toc: NonNullable<Note['toc']> = [];
  for (const line of md.split('\n')) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const text = m[2].replace(/[*_`]/g, '');
    toc.push({ level: m[1].length === 2 ? 2 : 3, text, id: slugifyText(text) });
  }
  return toc.slice(0, 20);
}

function addHeadingIds(html: string, toc: NonNullable<Note['toc']>): string {
  let i = 0;
  return html.replace(/<(h[23])>(.*?)<\/h[23]>/g, (_m, tag: string, inner: string) => {
    const t = toc[i++];
    if (!t) return _m;
    return `<${tag} id="${t.id}">${inner}</${tag}>`;
  });
}

async function mdToHtml(md: string): Promise<string> {
  const out = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeKatex, { strict: false, throwOnError: false })
    .use(rehypeHighlight)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return out.toString();
}

let cache: Note[] | null = null;

export async function getAllNotes(): Promise<Note[]> {
  if (cache) return cache;
  const root = contentRoot();
  const notesDir = path.join(root, 'notes');
  const files = walkMd(notesDir, root);
  const metas = files.map((rel) => {
    const raw = fs.readFileSync(path.join(root, rel), 'utf8');
    const { meta, body } = parseNoteFile(raw, rel);
    return { meta, body };
  });
  const bySlug = new Map<string, Note>();
  const notes: Note[] = metas.map(({ meta, body }) => {
    const n: Note = { ...meta, body };
    bySlug.set(n.slug.toLowerCase(), n);
    return n;
  });
  for (const n of notes) {
    const withLinks = resolveWikiLinks(n.body, bySlug);
    n.outLinks = [...withLinks.matchAll(/\]\(\/blog\/([^)]+)\)/g)].map((m) => m[1]);
    const toc = extractToc(withLinks);
    n.toc = toc;
    const words = withLinks.split(/\s+/).filter(Boolean).length;
    n.readingMins = Math.max(1, Math.round(words / 200));
    if (!n.excerpt) {
      const first = withLinks.split(/\n\s*\n/)[0]?.replace(/[#*`>\[\]()]/g, '').trim() ?? '';
      n.excerpt = first.slice(0, 180);
    }
    n.html = addHeadingIds(await mdToHtml(withLinks), toc);
  }
  // backlinks
  const incoming = new Map<string, string[]>();
  for (const n of notes) {
    for (const t of n.outLinks ?? []) {
      if (!incoming.has(t)) incoming.set(t, []);
      incoming.get(t)!.push(n.slug);
    }
  }
  for (const n of notes) n.backlinks = incoming.get(n.slug) ?? [];
  cache = notes.sort((a, b) => (b.publishedAt || b.path).localeCompare(a.publishedAt || a.path));
  copyPublicImages(root);
  return cache;
}

/** Rewrite repo-relative image paths to the public images dir; copy files. */
function copyPublicImages(root: string) {
  try {
    const src = path.join(root, 'images');
    if (!fs.existsSync(src)) return;
    const dest = path.join(ROOT, 'public', 'vault-images');
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      fs.copyFileSync(path.join(src, f), path.join(dest, f));
    }
  } catch {
    /* best-effort */
  }
}

export function publicImage(src: string): string {
  if (/^(https?:|data:)/.test(src)) return src;
  const clean = src.replace(/^\.?\//, '').replace(/^(images|notes\/images)\//, '');
  return `/MyBlog/vault-images/${clean}`;
}

// ---------- public access layer (build-time; privacy enforced here) ----------

export async function listPublicNotes(): Promise<Note[]> {
  return (await getAllNotes()).filter(isPublicNote);
}

export async function getPublicBySlug(slug: string): Promise<Note | null> {
  const n = (await getAllNotes()).find((x) => x.slug === slug);
  if (!n || !isReachableNote(n)) return null;
  return n;
}

export async function searchPublic(q: string): Promise<Note[]> {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const notes = await listPublicNotes();
  const scored = notes
    .map((n) => {
      const hay = `${n.title} ${n.excerpt} ${n.tags.join(' ')} ${n.body}`.toLowerCase();
      let score = 0;
      if (n.title.toLowerCase().includes(needle)) score += 3;
      if (n.tags.some((t) => t.toLowerCase().includes(needle))) score += 2;
      if (hay.includes(needle)) score += 1;
      return { n, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((s) => s.n);
}

export async function collectionsWithCounts(): Promise<Collection[]> {
  const notes = await listPublicNotes();
  const map = new Map<string, number>();
  for (const n of notes) map.set(n.collection, (map.get(n.collection) ?? 0) + 1);
  return [...map.entries()]
    .map(([slug, count]) => ({ slug, name: prettyName(slug), count }))
    .sort((a, b) => b.count - a.count);
}

export async function tagsWithCounts(): Promise<{ tag: string; count: number }[]> {
  const notes = await listPublicNotes();
  const map = new Map<string, number>();
  for (const n of notes) for (const t of n.tags) map.set(t, (map.get(t) ?? 0) + 1);
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

export { prettyName };

export async function relatedNotes(note: Note, limit = 3): Promise<Note[]> {
  const notes = (await listPublicNotes()).filter((n) => n.slug !== note.slug);
  const scored = notes.map((n) => {
    let s = 0;
    if (n.collection === note.collection) s += 2;
    s += n.tags.filter((t) => note.tags.includes(t)).length;
    if (note.backlinks?.includes(n.slug) || n.backlinks?.includes(note.slug)) s += 3;
    return { n, s };
  });
  return scored
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.n);
}

export async function graphData(): Promise<GraphData> {
  const notes = (await listPublicNotes()).filter((n) => n.status !== 'trashed');
  const slugs = new Set(notes.map((n) => n.slug));
  const edges: GraphData['edges'] = [];
  for (const n of notes) {
    for (const t of n.outLinks ?? []) {
      if (slugs.has(t)) edges.push({ from: n.slug, to: t });
    }
  }
  const linked = new Set([...edges.map((e) => e.from), ...edges.map((e) => e.to)]);
  return {
    nodes: notes.map((n) => ({ slug: n.slug, title: n.title, orphans: !linked.has(n.slug) })),
    edges,
  };
}
