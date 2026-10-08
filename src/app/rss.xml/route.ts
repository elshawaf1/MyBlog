import { listPublicNotes } from '@/lib/vault/content';

function base(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elshawaf1.github.io/MyBlog/').replace(/\/$/, '');
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function GET() {
  const notes = await listPublicNotes();
  const b = base();
  const items = notes
    .map(
      (n) => `    <item>
      <title>${esc(n.title)}</title>
      <link>${b}/blog/${n.slug}/</link>
      <guid>${b}/blog/${n.slug}/</guid>
      <description>${esc(n.excerpt)}</description>
      <pubDate>${new Date(n.publishedAt || '2026-01-01').toUTCString()}</pubDate>
    </item>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>Ahmed Yasser — Stories</title>\n    <link>${b}/blog/</link>\n    <description>Published notes from a personal knowledge vault.</description>\n${items}\n  </channel>\n</rss>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml' } });
}
