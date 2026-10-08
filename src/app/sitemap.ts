import type { MetadataRoute } from 'next';
import { listPublicNotes } from '@/lib/vault/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const b = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elshawaf1.github.io/MyBlog/').replace(/\/$/, '');
  const notes = await listPublicNotes();
  const pages = ['', '/blog', '/topics', '/search', '/about'].map((p) => ({
    url: `${b}${p ? `${p}/` : '/'}`,
    lastModified: new Date(),
  }));
  const posts = notes
    .filter((n) => n.allowIndex)
    .map((n) => ({
      url: `${b}/blog/${n.slug}/`,
      lastModified: new Date(n.publishedAt || '2026-01-01'),
    }));
  const tags = [...new Set(notes.filter((n) => n.allowIndex).flatMap((n) => n.tags))].map((t) => ({
    url: `${b}/tags/${t}/`,
    lastModified: new Date(),
  }));
  return [...pages, ...posts, ...tags];
}
