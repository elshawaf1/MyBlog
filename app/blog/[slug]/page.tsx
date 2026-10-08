import Link from 'next/link';
import { getPosts } from '@/lib/content';
import { site } from '@/config/site';
import Byline from '@/components/Byline';
import ShareRow from '@/components/ShareRow';
import SlugBand from '@/components/SlugBand';
import ProfilePhoto from '@/components/ProfilePhoto';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return notFound();
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="m-article">
      <div className="kicker">◈ {post.tags[0] ?? 'Story'} / {post.date}</div>
      <h1>{post.title}</h1>
      {post.summary && <p className="subtitle">{post.summary}</p>}
      <Byline date={post.date} mins={post.mins} big />
      <ShareRow title={post.title} />
      <div style={{ margin: '0 0 36px' }}>
        <SlugBand seed={post.slug} tall />
      </div>
      <div className="m-body m-body-serif" dangerouslySetInnerHTML={{ __html: post.contentHtml ?? '' }} />
      {post.tags.length > 0 && (
        <div className="m-tags">
          {post.tags.map((t) => (
            <Link key={t} className="tag-pill" href="/blog">{t}</Link>
          ))}
        </div>
      )}
      <div className="author-card">
        <ProfilePhoto src={site.photo} alt={site.name} />
        <div>
          <div className="meta">◈ Transmitted by</div>
          <b>{site.name}</b>
          <div className="meta">{site.title} — {site.tagline}</div>
          <div style={{ marginTop: 8 }}>
            <Link href="/about">Open dossier →</Link>
          </div>
        </div>
      </div>
      {more.length > 0 && (
        <>
          <h2 className="sec">More signals</h2>
          <div className="more-grid">
            {more.map((m) => (
              <Link key={m.slug} href={`/blog/${m.slug}`} style={{ textDecoration: 'none' }}>
                <SlugBand seed={m.slug} />
                <h3>{m.title}</h3>
                <div className="meta">{m.date} · {m.mins} min read</div>
              </Link>
            ))}
          </div>
        </>
      )}
    </article>
  );
}
