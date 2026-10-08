import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const b = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elshawaf1.github.io/MyBlog/').replace(/\/$/, '');
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/app', '/login'] }],
    sitemap: `${b}/sitemap.xml`,
  };
}
