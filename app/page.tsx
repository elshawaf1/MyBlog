import Link from 'next/link';
import { site } from '@/config/site';
import { visibility } from '@/config/visibility';
import { getPosts, getProjects, getPublications } from '@/lib/content';
import Byline from '@/components/Byline';
import PostRow from '@/components/PostRow';
import Thumb from '@/components/Thumb';

export default async function Home() {
  const posts = await getPosts();
  const projects = await getProjects();
  const pubs = getPublications();
  const hero = posts.find((p) => p.featured) ?? posts[0];
  const trending = posts.filter((p) => p !== hero).slice(0, 3);
  const tags = [...new Set(posts.flatMap((p) => p.tags))].slice(0, 10);

  return (
    <>
      {hero && visibility.blog ? (
        <header className="hero-m">
          <div className="kicker">Featured story</div>
          <h1>
            <Link href={`/blog/${hero.slug}`} style={{ textDecoration: 'none' }}>
              {hero.title}
            </Link>
          </h1>
          <p className="lede">{hero.summary}</p>
          <Byline date={hero.date} mins={hero.mins} big />
          <Link href={`/blog/${hero.slug}`} style={{ textDecoration: 'none' }}>
            <Thumb seed={hero.slug} letter={hero.title.charAt(0) || 'A'} large />
          </Link>
        </header>
      ) : (
        <header className="hero-m">
          <div className="kicker">{site.title}</div>
          <h1>{site.name}</h1>
          <p className="lede">{site.bio}</p>
          <div className="btns">
            <a className="btn solid" href={site.cvPath}>Download CV</a>
            <a className="btn" href={site.scholar}>Google Scholar</a>
            <a className="btn" href={site.github}>GitHub</a>
            <a className="btn" href={`mailto:${site.email}`}>Email</a>
          </div>
        </header>
      )}

      {trending.length > 0 && (
        <section className="trend">
          <div className="trend-head">Trending on {site.name}&rsquo;s blog</div>
          <div className="trend-grid">
            {trending.map((p, i) => (
              <div className="trend-item" key={p.slug}>
                <span className="trend-num">0{i + 1}</span>
                <div>
                  <div className="meta">{site.name} · {p.mins} min read</div>
                  <h4>
                    <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  </h4>
                  <div className="meta">{p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="m-cols">
        <div>
          {visibility.blog && posts.length > 0 && (
            <>
              {posts.map((p) => (
                <PostRow key={p.slug} p={p} />
              ))}
              <p style={{ marginTop: 16 }}>
                <small><Link href="/blog">All articles + search →</Link></small>
              </p>
            </>
          )}
        </div>
        <aside className="side">
          <div className="side-block">
            <h5>About</h5>
            <p className="side-bio">{site.bio}</p>
            <Link href="/about">More about {site.name} →</Link>
          </div>
          {visibility.projects && projects.length > 0 && (
            <div className="side-block">
              <h5>Selected projects</h5>
              {projects.filter((x) => x.featured).slice(0, 3).map((pr) => (
                <div className="card" key={pr.slug}>
                  <h3 style={{ fontSize: 16 }}>{pr.title}</h3>
                  <p><small className="muted">{pr.summary}</small></p>
                </div>
              ))}
              <small><Link href="/projects">All projects →</Link></small>
            </div>
          )}
          {visibility.publications && pubs.length > 0 && (
            <div className="side-block">
              <h5>Latest research</h5>
              {pubs.slice(0, 3).map((p) => (
                <div className="card" key={p.title}>
                  <h3 style={{ fontSize: 16 }}>{p.title}</h3>
                  <div className="meta">{p.authors} · {p.venue} {p.year}</div>
                </div>
              ))}
              <small><Link href="/publications">All publications →</Link></small>
            </div>
          )}
          {tags.length > 0 && (
            <div className="side-block">
              <h5>Topics</h5>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((t) => (
                  <Link key={t} className="tag-pill" href="/blog">{t}</Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
