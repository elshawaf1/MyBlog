import Link from 'next/link';
import { site } from '@/config/site';
import { visibility } from '@/config/visibility';

export default function Navbar() {
  return (
    <nav>
      <Link className="brand" href="/">{site.name}</Link>
      <Link href="/about">About</Link>
      {visibility.research && <Link href="/research">Research</Link>}
      {visibility.publications && <Link href="/publications">Publications</Link>}
      {visibility.projects && <Link href="/projects">Projects</Link>}
      {visibility.blog && <Link href="/blog">Blog</Link>}
      {visibility.news && <Link href="/news">News</Link>}
      {visibility.cv && <Link href="/cv">CV</Link>}
    </nav>
  );
}
