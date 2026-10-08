import { site } from '@/config/site';

export default function Footer() {
  return (
    <footer>
      © {new Date().getFullYear()} {site.name} · <a href={site.github}>GitHub</a> ·{' '}
      <a href={site.scholar}>Scholar</a> · <a href={`mailto:${site.email}`}>Email</a>
      {' · '}<a href="/admin">Admin</a>
    </footer>
  );
}
