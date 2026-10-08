import Link from 'next/link';
import { getPosts } from '@/lib/content';

export default async function Blog() {
  const posts = await getPosts();
  return (
    <>
      <h2>Articles</h2>
      <p><small className="muted">Add a <code>.md</code> file in <code>content/blog/</code>. Set <code>published: false</code> to hide as draft.</small></p>
      <ul className="clean">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            <div className="meta">{p.date} · {p.tags.join(', ')}</div>
            <div><small className="muted">{p.summary}</small></div>
          </li>
        ))}
      </ul>
    </>
  );
}
