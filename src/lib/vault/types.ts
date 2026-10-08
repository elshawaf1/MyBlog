export type NoteStatus = 'draft' | 'published' | 'archived' | 'trashed';
export type NoteVisibility = 'private' | 'unlisted' | 'public';

export interface NoteMeta {
  title: string;
  slug: string;
  status: NoteStatus;
  visibility: NoteVisibility;
  collection: string;
  tags: string[];
  excerpt: string;
  publishedAt: string;
  allowIndex: boolean;
  pinned: boolean;
  /** vault-relative file path, e.g. notes/ai-research/slug.md */
  path: string;
  updatedAt: string;
}

export interface Note extends NoteMeta {
  body: string;
  html?: string;
  toc?: { level: 2 | 3; text: string; id: string }[];
  readingMins?: number;
  outLinks?: string[];
  backlinks?: string[];
}

export interface Collection {
  slug: string;
  name: string;
  count: number;
}

export interface GraphData {
  nodes: { slug: string; title: string; orphans: boolean }[];
  edges: { from: string; to: string }[];
}

/** Safe public card fields — the ONLY shape passed to client components.
 *  Never includes body/html/backlinks (which may reference private slugs). */
export type CardNote = Pick<
  Note,
  'slug' | 'title' | 'excerpt' | 'tags' | 'collection' | 'publishedAt' | 'readingMins'
>;

export function toCardNote(n: Note): CardNote {
  return {
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    tags: n.tags,
    collection: n.collection,
    publishedAt: n.publishedAt,
    readingMins: n.readingMins ?? 1,
  };
}

export const STATUSES: NoteStatus[] = ['draft', 'published', 'archived', 'trashed'];
export const VISIBILITIES: NoteVisibility[] = ['private', 'unlisted', 'public'];

export function isPublicNote(n: NoteMeta): boolean {
  return n.status === 'published' && n.visibility === 'public';
}

/** Reachable by exact URL: public, or published+unlisted. Never private/draft. */
export function isReachableNote(n: NoteMeta): boolean {
  return (
    n.status === 'published' && (n.visibility === 'public' || n.visibility === 'unlisted')
  );
}
