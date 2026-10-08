import { getPosts } from '@/lib/content';
import BlogSearch from '@/components/BlogSearch';

export default async function Blog() {
  const posts = await getPosts();
  return (
    <div className="narrow">
      <div className="kicker" style={{ marginTop: 56 }}>01 / Archive</div>
      <h2 className="sec" style={{ marginTop: 0 }}>Stories from the lab</h2>
      <p className="sec-sub">Essays, notes, and tutorials on AI — newest first.</p>
      <BlogSearch posts={posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        tags: p.tags,
        summary: p.summary,
        mins: p.mins,
      }))} />
    </div>
  );
}
