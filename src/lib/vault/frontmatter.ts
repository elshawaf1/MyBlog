import type { Note, NoteMeta, NoteStatus, NoteVisibility } from './types';

const FM_ORDER = [
  'title',
  'slug',
  'status',
  'visibility',
  'collection',
  'tags',
  'excerpt',
  'publishedAt',
  'allowIndex',
  'pinned',
];

function q(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

/** Minimal YAML-subset parser (matches what gray-matter/js-yaml also reads). */
export function parseNoteFile(raw: string, path: string): { meta: NoteMeta; body: string } {
  let head = '';
  let body = raw;
  if (raw.startsWith('---')) {
    const end = raw.indexOf('\n---', 3);
    if (end !== -1) {
      head = raw.slice(3, end).trim();
      body = raw.slice(end + 4).replace(/^\n/, '');
    }
  }
  const data: Record<string, unknown> = {};
  for (const line of head.split('\n')) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      const inner = val.slice(1, -1).trim();
      data[key] = inner ? inner.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) : [];
    } else if (val === 'true') data[key] = true;
    else if (val === 'false') data[key] = false;
    else data[key] = val.replace(/^['"]|['"]$/g, '');
  }
  const str = (k: string, fb = ''): string => String(data[k] ?? fb);
  const meta: NoteMeta = {
    title: str('title', 'Untitled'),
    slug: str('slug', fileSlug(path)),
    status: (str('status', 'draft') as NoteStatus) || 'draft',
    visibility: (str('visibility', 'private') as NoteVisibility) || 'private',
    collection: str('collection', 'inbox'),
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    excerpt: str('excerpt', ''),
    publishedAt: str('publishedAt', ''),
    allowIndex: data.allowIndex !== false,
    pinned: data.pinned === true,
    path,
    updatedAt: str('publishedAt', ''),
  };
  return { meta, body };
}

export function stringifyNoteFile(meta: NoteMeta, body: string): string {
  const data: Record<string, unknown> = {
    title: meta.title,
    slug: meta.slug,
    status: meta.status,
    visibility: meta.visibility,
    collection: meta.collection,
    tags: meta.tags,
    excerpt: meta.excerpt,
    publishedAt: meta.publishedAt,
    allowIndex: meta.allowIndex,
    pinned: meta.pinned,
  };
  const lines = FM_ORDER.filter((k) => data[k] !== undefined).map((k) => {
    const v = data[k];
    if (Array.isArray(v)) return `${k}: [${v.map((x) => q(String(x))).join(', ')}]`;
    if (typeof v === 'boolean') return `${k}: ${v}`;
    return `${k}: ${q(String(v ?? ''))}`;
  });
  return `---\n${lines.join('\n')}\n---\n\n${body.replace(/^\n+/, '')}`;
}

export function fileSlug(path: string): string {
  const base = path.split('/').pop() ?? 'note';
  return base.replace(/\.md$/, '');
}

export function notePath(collection: string, slug: string): string {
  const clean = (s: string) =>
    s.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'note';
  return `notes/${clean(collection) || 'inbox'}/${clean(slug)}.md`;
}

export type { Note };
