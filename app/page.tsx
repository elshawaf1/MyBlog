import Link from 'next/link';
import { site } from '@/config/site';
import ProfilePhoto from '@/components/ProfilePhoto';
import { visibility } from '@/config/visibility';
import { getPosts, getProjects, getPublications, getNews } from '@/lib/content';

export default async function Home() {
  const posts = await getPosts();
  const projects = await getProjects();
  const pubs = getPublications();
  const news = getNews();

  return (
    <>
      <header className="hero">
        <ProfilePhoto src={site.photo} alt={site.name} />
        <h1>{site.name}</h1>
        <p>{site.title} — {site.tagline}</p>
        <div className="btns">
          <a className="btn solid" href={site.cvPath}>Download CV</a>
          <a className="btn" href={site.scholar}>Google Scholar</a>
          <a className="btn" href={site.github}>GitHub</a>
          <a className="btn" href={`mailto:${site.email}`}>Email</a>
        </div>
      </header>

      <p>
        I work on applied AI and research. This site collects my publications,
        projects, articles, and news in one place. See <Link href="/about">About</Link> for
        full bio.
      </p>

      {visibility.publications && pubs.length > 0 && (
        <>
          <h2>Featured Research</h2>
          {pubs.slice(0, 3).map((p) => (
            <div className="card" key={p.title}>
              <h3>{p.title}</h3>
              <div className="meta">{p.authors} · {p.venue} {p.year}</div>
              <small><a href={p.link}>Paper</a></small>
            </div>
          ))}
          <small><Link href="/publications">All publications →</Link></small>
        </>
      )}

      {visibility.projects && projects.length > 0 && (
        <>
          <h2>Featured Projects</h2>
          {projects.filter((x) => x.featured).slice(0, 3).map((pr) => (
            <div className="card" key={pr.slug}>
              <h3>{pr.title}</h3>
              <p><small className="muted">{pr.summary}</small></p>
              <small>{pr.stack.join(' · ')}</small>
            </div>
          ))}
          <small><Link href="/projects">All projects →</Link></small>
        </>
      )}

      {visibility.blog && posts.length > 0 && (
        <>
          <h2>Latest Articles</h2>
          <ul className="clean">
            {posts.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                <div className="meta">{p.date} — {p.summary}</div>
              </li>
            ))}
          </ul>
          <small><Link href="/blog">All articles →</Link></small>
        </>
      )}

      {visibility.news && news.length > 0 && (
        <>
          <h2>News</h2>
          <ul className="clean">
            {news.slice(0, 4).map((n, i) => (
              <li key={i}><span className="meta">{n.date} — </span>{n.text}</li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
