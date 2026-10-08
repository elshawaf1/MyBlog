import { site } from '@/config/site';

export default function Footer() {
  return (
    <footer className="site">
      <div>
        <a href="/about">About</a>
        <a href="/blog">Blog</a>
        <a href="/projects">Projects</a>
        <a href={site.github}>GitHub</a>
        <a href={site.scholar}>Scholar</a>
        <a href={`mailto:${site.email}`}>Email</a>
        <a href="/admin">Admin</a>
      </div>
      <div style={{ marginTop: 8 }}>© {new Date().getFullYear()} {site.name}</div>
    </footer>
  );
}
