import { getPosts } from '@/lib/content';
import BlogSearch from '@/components/BlogSearch';

export default async function Blog() {
  const posts = await getPosts();
  return (
    <>
      <h2>Articles</h2>
      <BlogSearch posts={posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        tags: p.tags,
        summary: p.summary,
      }))} />
    </>
  );
}
