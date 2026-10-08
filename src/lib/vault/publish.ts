import type { NoteMeta } from './types';

export interface PublishCheck {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/** Validate a note before publishing. Publishing never copies content —
 *  it only flips status/visibility; the static build picks it up. */
export function validatePublish(meta: NoteMeta, takenSlugs: string[], selfPath: string): PublishCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!meta.title.trim()) errors.push('Title is required.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.slug)) {
    errors.push('Slug must be URL-safe: lowercase letters, numbers, hyphens.');
  }
  if (takenSlugs.includes(meta.slug) && !selfPath.endsWith(`/${meta.slug}.md`)) {
    errors.push(`Slug "${meta.slug}" is already used by another note.`);
  }
  if (!meta.excerpt.trim()) warnings.push('No excerpt — one will be auto-derived from the first paragraph.');
  if (!meta.tags.length) warnings.push('No tags — the article will be harder to discover.');
  if (meta.visibility === 'unlisted') {
    warnings.push('Unlisted: reachable by exact URL only, excluded from lists/feeds/sitemap.');
  }
  if (meta.allowIndex && meta.visibility !== 'public') {
    warnings.push('allowIndex has no effect unless visibility is public.');
  }
  return { ok: errors.length === 0, errors, warnings };
}

/** Human-readable effective access, shown in the editor publish panel. */
export function effectiveAccess(meta: NoteMeta): string {
  if (meta.status === 'trashed') return 'Deleted — in trash, restored or permanently deletable.';
  if (meta.status === 'archived') return 'Archived — hidden everywhere, kept in the vault.';
  if (meta.status !== 'published') return 'Not publicly accessible — draft in your vault only.';
  if (meta.visibility === 'public') {
    return meta.allowIndex
      ? 'Public article — listed on the blog, indexed by search engines.'
      : 'Public article — listed on the blog, search engines asked not to index.';
  }
  if (meta.visibility === 'unlisted') return 'Unlisted — exact URL only, not in lists/feeds/sitemap.';
  return 'Not publicly accessible — private in your vault only.';
}
