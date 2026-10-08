import { getPosts } from '@/lib/content';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Post({ params }: { params: { slug: string } }) {
  const posts = await getPosts();
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return notFound();
  return (
    <article className="post">
      <h2>{post.title}</h2>
      <div className="meta">{post.date} · {post.tags.join(', ')}</div>
      <div dangerouslySetInnerHTML={{ __html: post.contentHtml ?? '' }} />
    </article>
  );
}
