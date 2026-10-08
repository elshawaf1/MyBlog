import Link from 'next/link';
import { site } from '@/config/site';
import { visibility } from '@/config/visibility';
import ThemeToggle from '@/components/ThemeToggle';

export default function Navbar() {
  return (
    <nav>
      <Link className="brand" href="/">{site.name}</Link>
      <Link href="/about">About</Link>
      {visibility.research && <Link href="/research">Research</Link>}
      {visibility.publications && <Link href="/publications">Publications</Link>}
      {visibility.projects && <Link href="/projects">Projects</Link>}
      {visibility.blog && <Link href="/blog">Blog</Link>}
      {visibility.cv && <Link href="/cv">CV</Link>}
      <ThemeToggle />
    </nav>
  );
}
