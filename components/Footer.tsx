import { site } from '@/config/site';

export default function Footer() {
  return (
    <footer className="site">
      <div className="foot-mark">AY<span>◆</span></div>
      <nav>
        <a href="/about">About</a>
        <a href="/blog">Stories</a>
        <a href="/projects">Builds</a>
        <a href="/publications">Papers</a>
        <a href={site.github}>GitHub</a>
        <a href={site.scholar}>Scholar</a>
        <a href={`mailto:${site.email}`}>Email</a>
        <a href="/admin">Admin</a>
      </nav>
      <small>© {new Date().getFullYear()} {site.name} — built in the lab</small>
    </footer>
  );
}
