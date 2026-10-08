import Link from 'next/link';
import { site } from '@/config/site';
import { visibility } from '@/config/visibility';
import ThemeToggle from '@/components/ThemeToggle';
import ProfilePhoto from '@/components/ProfilePhoto';

export default function Navbar() {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">AY◆</span> {site.name}
        </Link>
        <nav className="links">
          <Link href="/about">About</Link>
          {visibility.research && <Link href="/research">Research</Link>}
          {visibility.publications && <Link href="/publications">Papers</Link>}
          {visibility.projects && <Link href="/projects">Builds</Link>}
          {visibility.blog && <Link href="/blog">Stories</Link>}
          {visibility.cv && <Link href="/cv">CV</Link>}
        </nav>
        <span className="online"><i />online</span>
        <ThemeToggle />
        <ProfilePhoto src={site.photo} alt={site.name} />
      </div>
    </div>
  );
}
